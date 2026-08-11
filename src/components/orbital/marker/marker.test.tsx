import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { renderInScene } from '../../../test/helpers'
import { Constants } from '../../../constants'
import { Scale } from '../../../utils/scale'
import { Marker, createMarkerMaterial, getMarkerFade } from './marker'

const three = vi.hoisted(() => ({
  camera: { fov: 50, matrixWorld: undefined as unknown },
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

describe('Orbital Marker Component', () => {
  const { FADE_IN, FADE_OUT, GLOW_SPREAD, RADIUS, SEGMENTS, THICKNESS } = Constants.WebGL.Marker
  const { LABEL_GLOW, LABEL_MATERIAL } = Constants.WebGL
  const PHOBOS_RADIUS = 11.2667
  const JUPITER_RADIUS = 69911
  const FOV = three.camera.fov
  const HEIGHT = three.size.height
  const distanceFor = (apparentRadius: number, radius = PHOBOS_RADIUS) => {
    const visibleHeight = (Scale(radius) / apparentRadius) * HEIGHT

    return visibleHeight / (2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2))
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMarkerFade()', () => {
    it('should draw the marker whole for a body too small to make out', () => {
      expect(getMarkerFade(0)).toBe(1)
      expect(getMarkerFade(FADE_IN)).toBe(1)
    })

    it('should drop the marker entirely once the body carries itself', () => {
      expect(getMarkerFade(FADE_OUT)).toBe(0)
      expect(getMarkerFade(Infinity)).toBe(0)
    })

    it('should hand over gradually between the two', () => {
      expect(getMarkerFade((FADE_IN + FADE_OUT) / 2)).toBeCloseTo(0.5)
    })

    it('should fade away as the body grows, never back toward it', () => {
      const steps = [FADE_IN, 3, 4, 5, FADE_OUT]

      steps.forEach((apparent, index) => {
        if (index === 0) return

        expect(getMarkerFade(apparent)).toBeLessThan(getMarkerFade(steps[index - 1]))
      })
    })

    it('should stay within bounds at any size the body may read at', () => {
      const sizes = [0, 0.001, 1, FADE_IN, 4, FADE_OUT, 100, Infinity]

      sizes.forEach((apparent) => {
        const fade = getMarkerFade(apparent)

        expect(fade).toBeGreaterThanOrEqual(0)
        expect(fade).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('createMarkerMaterial()', () => {
    it('should start out invisible, for the frame loop to fade in', () => {
      const material = createMarkerMaterial('white')

      expect(material.transparent).toBe(true)
      expect(material.opacity).toBe(0)
    })

    it('should go behind an orbital passing in front of the one it marks', () => {
      const material = createMarkerMaterial('white')

      expect(material.depthTest).toBe(true)
      expect(material.depthWrite).toBe(false)
    })

    it('should wear the color it is given', () => {
      const material = createMarkerMaterial(0x0089bc) as THREE.MeshBasicMaterial

      expect(material.color).toEqual(new THREE.Color(0x0089bc))
    })
  })

  describe('render()', () => {
    const rings = (container: HTMLElement) =>
      Array.from(container.querySelectorAll('ringGeometry')).map((ring) =>
        (ring.getAttribute('args') as string).split(',').map(Number)
      )

    it('should draw an open ring rather than a filled disc', () => {
      const { container } = renderInScene(<Marker radius={PHOBOS_RADIUS} />)
      const [inner, outer] = rings(container)[1]

      expect(outer).toBeCloseTo(RADIUS)
      expect(inner).toBeCloseTo(RADIUS * (1 - THICKNESS))
      expect(inner).toBeGreaterThan(0) // an inner radius of zero would fill it in
    })

    it('should draw the ring smoothly enough to read as a circle', () => {
      const { container } = renderInScene(<Marker radius={PHOBOS_RADIUS} />)

      expect(rings(container)[1][2]).toBe(SEGMENTS)
    })

    it('should stand a halo out past the ring on both sides, as an outline would', () => {
      const { container } = renderInScene(<Marker radius={PHOBOS_RADIUS} />)
      const [halo, ring] = rings(container)

      expect(halo[0]).toBeCloseTo(ring[0] - GLOW_SPREAD)
      expect(halo[1]).toBeCloseTo(ring[1] + GLOW_SPREAD)
    })
  })

  describe('useFrame()', () => {
    const stubMarker = (container: HTMLElement, cameraDistance: number) => {
      const [glow, ring] = Array.from(container.querySelectorAll('mesh'))

      /** A world matrix standing the given object at the given point. */
      const standingAt = (z: number) => new THREE.Matrix4().setPosition(new THREE.Vector3(0, 0, z))

      three.camera.matrixWorld = standingAt(cameraDistance)

      ;[glow, ring].forEach((mesh) =>
        Object.assign(mesh, {
          visible: false,
          material: { opacity: 0 },
          matrixWorld: standingAt(0)
        })
      )

      type Stub = { visible: boolean; material: { opacity: number } }

      return { glow: glow as unknown as Stub, ring: ring as unknown as Stub }
    }

    const advanceFrame = () => {
      const { calls } = vi.mocked(useFrame).mock
      const tick = calls[calls.length - 1][0] as unknown as (state: unknown, delta: number) => void

      tick(null, 0)
    }

    const renderMarker = (
      cameraDistance: number,
      { radius = PHOBOS_RADIUS, hovered = false } = {}
    ) => {
      const stubs = stubMarker(
        renderInScene(<Marker radius={radius} hovered={hovered} />).container,
        cameraDistance
      )

      advanceFrame()

      return stubs
    }

    it('should show the marker of a body too small to make out', () => {
      expect(renderMarker(distanceFor(FADE_IN / 2)).ring.visible).toBe(true)
    })

    it('should hide the marker of a body large enough to carry itself', () => {
      expect(renderMarker(distanceFor(FADE_OUT * 2)).ring.visible).toBe(false)
    })

    it('should hide the marker of a planet while showing that of its moon', () => {
      const distance = distanceFor(FADE_IN / 2)
      const moon = renderMarker(distance)
      const planet = renderMarker(distance, { radius: JUPITER_RADIUS })

      expect(moon.ring.visible).toBe(true)
      expect(planet.ring.visible).toBe(false)
    })

    it('should carry the same weight as the text it sits beside', () => {
      const { ring } = renderMarker(distanceFor(FADE_IN / 100))

      expect(ring.material.opacity).toBe(LABEL_MATERIAL.opacity)
    })

    it('should fade the marker against how large the body has grown', () => {
      const { ring } = renderMarker(distanceFor((FADE_IN + FADE_OUT) / 2))

      expect(ring.material.opacity).toBeCloseTo(LABEL_MATERIAL.opacity / 2)
      expect(ring.material.opacity).toBeLessThan(LABEL_MATERIAL.opacity)
      expect(ring.material.opacity).toBeGreaterThan(0)
    })

    it('should leave the body its own hits once the marker is gone', () => {
      const { ring } = renderMarker(distanceFor(FADE_OUT * 2))

      expect(ring.visible).toBe(false)
      expect(ring.material.opacity).toBe(0)
    })

    describe('the halo it wears when hovered', () => {
      it('should stay away while the pointer is elsewhere', () => {
        const { glow } = renderMarker(distanceFor(FADE_IN / 2))

        expect(glow.visible).toBe(false)
        expect(glow.material.opacity).toBe(0)
      })

      it('should come up at the same strength as the text outline', () => {
        const { glow } = renderMarker(distanceFor(FADE_IN / 100), { hovered: true })

        expect(glow.visible).toBe(true)
        expect(glow.material.opacity).toBeCloseTo(LABEL_GLOW.OPACITY)
      })

      it('should sit under the ring it surrounds, never over it', () => {
        const { glow, ring } = renderMarker(distanceFor(FADE_IN / 100), { hovered: true })

        expect(glow.material.opacity).toBeLessThan(ring.material.opacity)
      })

      it('should fade away with the marker it belongs to', () => {
        const { glow } = renderMarker(distanceFor((FADE_IN + FADE_OUT) / 2), { hovered: true })

        expect(glow.material.opacity).toBeCloseTo(LABEL_GLOW.OPACITY / 2)
      })

      it('should stay away once the marker itself is gone', () => {
        const { glow } = renderMarker(distanceFor(FADE_OUT * 2), { hovered: true })

        expect(glow.visible).toBe(false)
        expect(glow.material.opacity).toBe(0)
      })
    })
  })
})
