import { act } from '@testing-library/react'
import * as THREE from 'three'
import { renderInScene } from '../../../test/helpers'
import { Constants } from '../../../constants'
import { Scale } from '../../../utils/scale'
import { Clouds, applyCloudTexture, createCloudMaterial, getCloudRadius } from './clouds'

describe('Clouds Component', () => {
  /** Earth, the one body the data gives a cloud deck. */
  const EARTH = { radius: 6371, url: 'Earth_clouds.jpg' }

  /** The textures the deck asked for, and the callbacks waiting on them. */
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

  describe('getCloudRadius()', () => {
    it('should stand the deck off the surface it is drawn over', () => {
      expect(getCloudRadius(EARTH.radius)).toBeGreaterThan(Scale(EARTH.radius))
    })

    it('should stand it off by its share of the body, so it clears any of them', () => {
      const { HEIGHT_SCALE } = Constants.WebGL.Clouds

      expect(getCloudRadius(EARTH.radius)).toBeCloseTo(Scale(EARTH.radius * (1 + HEIGHT_SCALE)))
    })

    it('should stand off a body drawn inflated by the size it is drawn at', () => {
      const { MINIMUM_RADIUS } = Constants.WebGL
      const { HEIGHT_SCALE } = Constants.WebGL.Clouds

      expect(getCloudRadius(MINIMUM_RADIUS / 10)).toBeCloseTo(
        Scale(MINIMUM_RADIUS * (1 + HEIGHT_SCALE))
      )
    })
  })

  describe('applyCloudTexture()', () => {
    it('should draw the cloud with the texture, and see through the sky around it', () => {
      const material = createCloudMaterial()
      const texture = new THREE.Texture()

      applyCloudTexture(material, texture)

      // the one texture does both jobs: white cloud to draw, black sky to see through
      expect(material.map).toBe(texture)
      expect(material.alphaMap).toBe(texture)
    })

    it('should have the material rebuilt for the texture that just arrived', () => {
      const material = createCloudMaterial()
      const before = material.version

      applyCloudTexture(material, new THREE.Texture())

      // `needsUpdate` only ever winds this on; there is nothing to read it back off
      expect(material.version).toBeGreaterThan(before)
    })
  })

  describe('createCloudMaterial()', () => {
    it('should let the sky between the clouds show the surface through it', () => {
      const material = createCloudMaterial()

      expect(material.transparent).toBe(true)
      expect(material.depthWrite).toBe(false)
    })

    it('should nudge the deck ahead of the surface it lies a hair above', () => {
      const material = createCloudMaterial()
      const { DEPTH_BIAS } = Constants.WebGL.Clouds

      expect(material.polygonOffset).toBe(true)
      expect(material.polygonOffsetFactor).toEqual(-DEPTH_BIAS)
      expect(material.polygonOffsetUnits).toEqual(-DEPTH_BIAS)
    })

    it('should be lit by the sun rather than glowing of its own accord', () => {
      const material = createCloudMaterial()

      expect(material).toBeInstanceOf(THREE.MeshPhongMaterial)
      // phong's default sheen would otherwise put a highlight on the deck
      expect(material.specular.getHex()).toEqual(0x000000)
    })
  })

  describe('render()', () => {
    it('should draw a deck over the body', () => {
      const { container } = renderInScene(<Clouds {...EARTH} />)

      expect(container.querySelector('mesh sphereGeometry')).not.toBeNull()
    })

    it('should fetch the texture the data names', () => {
      renderInScene(<Clouds {...EARTH} />)

      expect(loads).toHaveLength(1)
      expect(loads[0].url).toContain('Earth_clouds.jpg')
    })

    it('should take the texture it fetched without complaint', () => {
      renderInScene(<Clouds {...EARTH} />)

      expect(() => act(() => loads[0].onLoad?.(new THREE.Texture()))).not.toThrow()
    })
  })
})
