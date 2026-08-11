import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { renderInScene } from '../../../test/helpers'
import { Constants } from '../../../constants'
import { getScreenRadius } from '../../../utils/sun'
import { Corona, SCREEN_QUAD, createCoronaMaterial } from './corona'
import FRAGMENT_SHADER from '../../../shaders/corona.frag.glsl?raw'

const three = vi.hoisted(() => ({
  camera: null as unknown as THREE.PerspectiveCamera,
  size: { width: 1200, height: 800 }
}))

vi.mock('@react-three/fiber', async () => {
  const React = (await import('react')).default

  return {
    Canvas: ({ children }: { children?: React.ReactNode }): React.ReactNode =>
      React.createElement('svg', null, children),
    useThree: () => three,
    useFrame: vi.fn()
  }
})

describe('Sun Corona Component', () => {
  const { COLOR, INTENSITY, BRIGHTNESS, RAY_DETAIL, CORONA_SPREAD, CORONA_CONTRAST, DRIFT } =
    Constants.WebGL.Sun

  const FOV = Constants.WebGL.Camera.FOV
  const HEIGHT = three.size.height

  /** Roughly how far out Earth orbits, in scene units. */
  const EARTH_ORBIT = 149.6

  beforeEach(() => {
    vi.clearAllMocks()

    three.camera = new THREE.PerspectiveCamera(FOV, three.size.width / three.size.height)
  })

  describe('createCoronaMaterial()', () => {
    it('should lay the glow over what is behind it rather than blotting it out', () => {
      const material = createCoronaMaterial()

      expect(material.blending).toBe(THREE.AdditiveBlending)
      expect(material.transparent).toBe(true)
    })

    it('should keep the corona out of the depth buffer entirely', () => {
      const material = createCoronaMaterial()

      expect(material.depthTest).toBe(false)
      expect(material.depthWrite).toBe(false)
    })

    it('should tint the corona the warm color of the star', () => {
      const { tint } = createCoronaMaterial().uniforms

      expect(tint.value.r).toBeGreaterThan(tint.value.g)
      expect(tint.value.g).toBeGreaterThan(tint.value.b)
    })

    it('should carry the tint past white in its brightest channel', () => {
      const { tint } = createCoronaMaterial().uniforms
      const expected = new THREE.Color(COLOR).multiplyScalar(INTENSITY)

      expect(tint.value.r).toBeCloseTo(expected.r)
      expect(tint.value.r).toBeGreaterThan(1)
    })

    it('should hand the shape of the effect to the shader as it is tuned', () => {
      const { brightness, rayDetail, coronaSpread, coronaContrast } =
        createCoronaMaterial().uniforms

      expect(brightness.value).toBe(BRIGHTNESS)
      expect(rayDetail.value).toBe(RAY_DETAIL)
      expect(coronaSpread.value).toBe(CORONA_SPREAD)
      expect(coronaContrast.value).toBe(CORONA_CONTRAST)
    })
  })

  describe('the shader it feeds', () => {
    const declared = Array.from(FRAGMENT_SHADER.matchAll(/^uniform\s+\w+\s+(\w+)\s*;/gm)).map(
      ([, name]) => name
    )
    const constant = (name: string) =>
      Number(FRAGMENT_SHADER.match(new RegExp(`const float ${name} = ([\\d.e-]+);`))?.[1])

    it('should declare every uniform the material hands it', () => {
      expect(declared.sort()).toEqual(Object.keys(createCoronaMaterial().uniforms).sort())
    })

    it('should draw the edge of the disc at the radius it is handed', () => {
      expect(constant('DISC_INNER')).toBeLessThan(1)
      expect(constant('DISC_OUTER')).toBeGreaterThan(1)
    })

    it('should hold the crown off zero before raising it to a power', () => {
      expect(constant('NO_CROWN')).toBeGreaterThan(0)
      expect(FRAGMENT_SHADER).toContain('pow(max(corona, NO_CROWN), coronaContrast)')
    })
  })

  describe('render()', () => {
    it('should draw the corona on a quad the size of the screen', () => {
      const { container } = renderInScene(<Corona />)
      const args = container.querySelector('planeGeometry')?.getAttribute('args')

      expect(args?.split(',').map(Number)).toEqual(SCREEN_QUAD)
    })

    it('should draw the corona over the bodies but under the labels', () => {
      const { container } = renderInScene(<Corona />)
      const order = Number(container.querySelector('mesh')?.getAttribute('renderOrder'))

      expect(order).toBe(Constants.WebGL.Sun.RENDER_ORDER)
      expect(order).toBeLessThan(Constants.WebGL.LABEL_RENDER_ORDER)
    })
  })

  describe('useFrame()', () => {
    const advance = (
      distance: number,
      { elapsed = 0, lookingAt = new THREE.Vector3(), bearing = 0 } = {}
    ) => {
      const { container } = renderInScene(<Corona />)
      const mesh = container.querySelector('mesh') as unknown as {
        visible: boolean
        material: THREE.ShaderMaterial
      }

      Object.assign(mesh, { visible: false, material: createCoronaMaterial() })

      // stood the given distance out from the sun, swung around it by the given bearing
      three.camera.position.set(Math.sin(bearing) * distance, 0, Math.cos(bearing) * distance)
      three.camera.lookAt(lookingAt)

      const { calls } = vi.mocked(useFrame).mock
      const tick = calls[calls.length - 1][0] as unknown as (state: unknown, delta: number) => void

      tick({ clock: { getElapsedTime: () => elapsed } }, 0)

      return { mesh, uniforms: mesh.material.uniforms }
    }

    it('should show the corona once the camera has the sun in front of it', () => {
      expect(advance(EARTH_ORBIT).mesh.visible).toBe(true)
    })

    it('should hide the corona from a camera turned away from the sun', () => {
      const away = new THREE.Vector3(0, 0, EARTH_ORBIT * 2)

      expect(advance(EARTH_ORBIT, { lookingAt: away }).mesh.visible).toBe(false)
    })

    it('should hide the corona from a camera that has fallen onto the sun', () => {
      // the projection would divide by no depth at all and hand the shader a NaN to spread
      expect(advance(0).mesh.visible).toBe(false)
    })

    it('should never hand the shader a sun position it cannot use', () => {
      const { uniforms } = advance(0)

      expect(Number.isFinite(uniforms.sunPosition.value.x)).toBe(true)
      expect(Number.isFinite(uniforms.sunPosition.value.y)).toBe(true)
    })

    it('should leave the corona where it was rather than placing a sun it cannot see', () => {
      const away = new THREE.Vector3(0, 0, EARTH_ORBIT * 2)
      const { uniforms } = advance(EARTH_ORBIT, { lookingAt: away })

      expect(uniforms.sunSize.value).toBe(0)
    })

    it('should put the sun in the middle of the screen for a camera looking straight at it', () => {
      const { uniforms } = advance(EARTH_ORBIT)

      expect(uniforms.sunPosition.value.x).toBeCloseTo(0)
      expect(uniforms.sunPosition.value.y).toBeCloseTo(0)
    })

    it('should carry the sun off to one side as the camera looks past it', () => {
      const past = new THREE.Vector3(-EARTH_ORBIT / 4, 0, 0)
      const { uniforms } = advance(EARTH_ORBIT, { lookingAt: past })

      expect(uniforms.sunPosition.value.x).toBeGreaterThan(0)
    })

    it('should size the disc against how far out the camera stands', () => {
      const { uniforms } = advance(EARTH_ORBIT)

      expect(uniforms.sunSize.value).toBeCloseTo(getScreenRadius(EARTH_ORBIT, FOV, HEIGHT))
    })

    it('should grow the disc as the camera closes on the star', () => {
      expect(advance(20).uniforms.sunSize.value).toBeGreaterThan(
        advance(200).uniforms.sunSize.value
      )
    })

    it('should fall back on the scene FOV for a camera that reports none of its own', () => {
      three.camera = new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1
      ) as unknown as THREE.PerspectiveCamera

      const { uniforms } = advance(EARTH_ORBIT)

      expect(uniforms.sunSize.value).toBeCloseTo(getScreenRadius(EARTH_ORBIT, FOV, HEIGHT))
    })

    it('should hand the shader the shape of the viewport, so the disc stays round', () => {
      const { uniforms } = advance(EARTH_ORBIT)

      expect(uniforms.aspectRatio.value).toBeCloseTo(three.size.width / three.size.height)
    })

    it('should keep the rays writhing as the clock runs on', () => {
      const start = advance(EARTH_ORBIT, { elapsed: 0 }).uniforms.phase.value
      const later = advance(EARTH_ORBIT, { elapsed: 10 }).uniforms.phase.value

      expect(start).toBe(0)
      expect(later).toBeCloseTo(10 * DRIFT)
      expect(later).toBeGreaterThan(start)
    })

    it('should turn up a different face of the star as the camera swings around it', () => {
      const front = advance(EARTH_ORBIT).uniforms.camAngle.value
      const side = advance(EARTH_ORBIT, { bearing: Math.PI / 2 }).uniforms.camAngle.value

      expect(front).toBeCloseTo(0)
      expect(side).toBeCloseTo(Math.PI / 2)
    })

    it('should hold the same face of the star as the camera dollies straight in', () => {
      expect(advance(20).uniforms.camAngle.value).toBeCloseTo(advance(200).uniforms.camAngle.value)
    })
  })
})
