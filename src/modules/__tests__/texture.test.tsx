import { act } from '@testing-library/react'
import * as THREE from 'three'
import { DoubleSide, FrontSide } from 'three'
import { renderInScene } from '../../test/helpers'
import { Constants } from '../../constants'
import { TextureMap } from '../../types'
import { PHONG_OUTGOING_LIGHT, Texture, restrictEmissiveToNightSide } from '../texture'

/** The material as the frame loop finds it, standing in for three's own behind the element. */
interface StubMaterial {
  emissive: { set: ReturnType<typeof vi.fn> }
  specular: { set: ReturnType<typeof vi.fn> }
  normalScale: { set: ReturnType<typeof vi.fn> }
  shininess: number
  needsUpdate: boolean
  map?: THREE.Texture
  bumpMap?: THREE.Texture
  emissiveMap?: THREE.Texture
}

describe('Texture Module', () => {
  /** The texture loads the module asked for, and the callbacks waiting on each of them. */
  let loads: { url: string; onLoad?: (texture: THREE.Texture) => void }[]

  beforeEach(() => {
    loads = []

    vi.spyOn(THREE.TextureLoader.prototype, 'load').mockImplementation((url, onLoad) => {
      loads.push({ url, onLoad })

      return new THREE.Texture()
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderModule = (textures?: TextureMap[], props: { transparent?: boolean } = {}) => {
    const result = renderInScene(<Texture textures={textures} {...props} />)
    const element = result.container.querySelector('meshPhongMaterial') as Element

    Object.assign(element, {
      emissive: { set: vi.fn() },
      specular: { set: vi.fn() },
      normalScale: { set: vi.fn() },
      shininess: 0,
      needsUpdate: false
    })

    return { ...result, element, material: element as unknown as StubMaterial }
  }

  /** Hands the module a texture it has been waiting on. */
  const deliver = (index = 0) => {
    const texture = new THREE.Texture()

    act(() => loads[index].onLoad?.(texture))

    return texture
  }

  describe('render()', () => {
    it('should render the material the bodies are drawn with', () => {
      const { element } = renderModule()

      expect(element).not.toBeNull()
    })

    it('should face outward by default', () => {
      const { element } = renderModule()

      expect(element.getAttribute('side')).toEqual(String(FrontSide))
    })

    it('should take the side it is given', () => {
      const { container } = renderInScene(<Texture side={DoubleSide} />)

      expect(container.querySelector('meshPhongMaterial')?.getAttribute('side')).toEqual(
        String(DoubleSide)
      )
    })

    it('should start from a black specular, so that only a specular map lends a sheen', () => {
      const { element } = renderModule(undefined, { transparent: true })

      expect(element.getAttribute('specular')).toEqual('0')
      expect(element.getAttribute('color')).toEqual(String(Constants.WebGL.MESH_DEFAULT_COLOR))
    })
  })

  describe('loading', () => {
    it('should ask for nothing when there are no textures', () => {
      renderModule()

      expect(THREE.TextureLoader.prototype.load).not.toHaveBeenCalled()
    })

    it('should ask for nothing when the textures are an empty list', () => {
      renderModule([])

      expect(THREE.TextureLoader.prototype.load).not.toHaveBeenCalled()
    })

    it('should resolve each texture against the static path', () => {
      renderModule([{ url: 'earth.jpg', slot: 'map' }])

      expect(loads[0].url).toEqual('/static/textures/map/earth.jpg')
    })

    it('should ask for every texture it is given', () => {
      renderModule([
        { url: 'earth.jpg', slot: 'map' },
        { url: 'earth-lights.jpg', slot: 'emissiveMap' }
      ])

      expect(loads).toHaveLength(2)
    })
  })

  describe('once a texture arrives', () => {
    it('should hang it on the slot it belongs to', () => {
      const { material } = renderModule([{ url: 'earth-bump.jpg', slot: 'bumpMap' }])
      const texture = deliver()

      expect(material.bumpMap).toBe(texture)
      expect(material.needsUpdate).toBe(true)
    })

    it('should hang an unplaced texture on the color map', () => {
      const { material } = renderModule([{ url: 'earth.jpg' } as TextureMap])
      const texture = deliver()

      expect(material.map).toBe(texture)
    })

    it('should light the night side once an emissive map arrives', () => {
      const { material } = renderModule([{ url: 'earth-lights.jpg', slot: 'emissiveMap' }])

      deliver()

      expect(material.emissive.set).toHaveBeenCalledWith(0x222222)
    })

    it('should raise a shine once a specular map arrives', () => {
      const { material } = renderModule([{ url: 'earth-spec.jpg', slot: 'specularMap' }])

      deliver()

      expect(material.specular.set).toHaveBeenCalledWith(Constants.WebGL.SPECULAR_COLOR)
      expect(material.shininess).toEqual(Constants.WebGL.SHININESS)
    })

    it('should deepen the relief once a normal map arrives', () => {
      const { material } = renderModule([{ url: 'earth-normal.jpg', slot: 'normalMap' }])

      deliver()

      expect(material.normalScale.set).toHaveBeenCalledWith(5, 5)
    })

    it('should leave the other slots alone', () => {
      const { material } = renderModule([{ url: 'earth.jpg', slot: 'map' }])

      deliver()

      expect(material.emissive.set).not.toHaveBeenCalled()
      expect(material.specular.set).not.toHaveBeenCalled()
      expect(material.normalScale.set).not.toHaveBeenCalled()
    })

    it('should drop a texture that outlived the material it was for', () => {
      const { material, unmount } = renderModule([{ url: 'earth.jpg', slot: 'emissiveMap' }])

      unmount()

      expect(() => deliver()).not.toThrow()
      expect(material.emissive.set).not.toHaveBeenCalled()
    })
  })

  describe('restrictEmissiveToNightSide()', () => {
    it('should mask the emissive term with the lit side of the body', () => {
      const shader = { fragmentShader: `void main() { ${PHONG_OUTGOING_LIGHT} }` }

      restrictEmissiveToNightSide(shader)

      expect(shader.fragmentShader).toContain('USE_EMISSIVEMAP')
      expect(shader.fragmentShader).toContain('totalEmissiveRadiance *= 1.0 - dayFactor;')
      expect(shader.fragmentShader).toContain(PHONG_OUTGOING_LIGHT)
    })

    it('should leave a shader it does not recognise as it found it', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const shader = { fragmentShader: 'void main() {}' }

      restrictEmissiveToNightSide(shader)

      expect(shader.fragmentShader).toEqual('void main() {}')
      expect(warn).toHaveBeenCalledTimes(1)
    })
  })
})
