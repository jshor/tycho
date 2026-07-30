import { renderInScene } from '../../../test/helpers'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'
import { Comet, getActivity, getHeading, getPlumeOrientation } from './comet'
import { Constants } from '../../../constants'
import { TailData } from '../../../types'

/** Halley's tail, as the orbital data configures it. */
const settings: TailData = {
  length: 100,
  width: 20,
  comaScale: 60,
  activeDistance: 450,
  restActivity: 0.18,
  dustColor: 0xfff0d0,
  ionColor: 0x66ccff
}

/** A square coutnerclockwise orbit. */
const path = [
  new Vector3(1, 0, 0),
  new Vector3(0, 0, 1),
  new Vector3(-1, 0, 0),
  new Vector3(0, 0, -1),
  new Vector3(1, 0, 0)
]

describe('Comet Component', () => {
  it('should render without crashing', () => {
    expect(() =>
      renderInScene(<Comet radius={15} settings={settings} pathVertices={path} bodyPercent={0} />)
    ).not.toThrow()
  })

  it('should render a flat coma and a conical tail', () => {
    const { container } = renderInScene(
      <Comet radius={15} settings={settings} pathVertices={path} bodyPercent={0} />
    )
    const comet = container.querySelector('group[name="comet"]')

    expect(comet?.querySelectorAll('mesh')).toHaveLength(1)
    expect(comet?.querySelectorAll('coneGeometry')).toHaveLength(1)
  })

  describe('getActivity()', () => {
    it('should vent hardest at the sun', () => {
      expect(getActivity(0, settings)).toEqual(1)
    })

    it('should fall back to a wisp once it is too far out to vent', () => {
      expect(getActivity(settings.activeDistance, settings)).toEqual(settings.restActivity)
    })

    it('should not fall below a wisp however far out it drifts', () => {
      expect(getActivity(settings.activeDistance * 100, settings)).toEqual(settings.restActivity)
    })

    it('should grow the tail as the comet comes in', () => {
      const far = getActivity(settings.activeDistance * 0.75, settings)
      const near = getActivity(settings.activeDistance * 0.25, settings)

      expect(near).toBeGreaterThan(far)
      expect(far).toBeGreaterThan(settings.restActivity)
    })

    it("should grow a full tail by the time it reaches Halley's perihelion", () => {
      const perihelion = (2667330000 * (1 - 0.967)) / Constants.WebGL.UNIT_SCALE

      expect(getActivity(perihelion, settings)).toBeGreaterThan(0.8)
    })
  })

  describe('getHeading()', () => {
    const heading = new Vector3()

    it('should point along the leg of the orbit the body is on', () => {
      const result = getHeading(path, 0, heading)

      expect(result.x).toBeCloseTo(new Vector3(-1, 0, 1).normalize().x)
      expect(result.z).toBeCloseTo(new Vector3(-1, 0, 1).normalize().z)
    })

    it('should turn with the body as it comes round the orbit', () => {
      const first = getHeading(path, 0, heading).clone()
      const opposite = getHeading(path, 0.5, heading).clone()

      expect(first.dot(opposite)).toBeCloseTo(-1)
    })

    it('should measure a real step at the very end of the orbit', () => {
      const result = getHeading(path, 1, heading)

      expect(result.length()).toBeCloseTo(1)
    })

    it('should hold its heading at the start of the orbit', () => {
      expect(getHeading(path, 0, heading).length()).toBeCloseTo(1)
    })
  })

  describe('getPlumeOrientation()', () => {
    const orientation = new Quaternion()

    /** Location of the given local axis of the oriented plume ends up pointing. */
    const axisOf = (axis: Vector3) => axis.clone().applyQuaternion(orientation)

    it('should lay the tail along the axis it is given', () => {
      const axis = new Vector3(1, 2, 3).normalize()

      getPlumeOrientation(axis, new Vector3(100, 0, 0), new Vector3(0, 500, 0), orientation)

      expect(axisOf(new Vector3(0, 1, 0)).angleTo(axis)).toBeCloseTo(0)
    })

    it('should lay it along that axis wherever the camera watches from', () => {
      const axis = new Vector3(0, 0, 1)

      getPlumeOrientation(axis, new Vector3(-60, 10, 80), new Vector3(-900, 400, 0), orientation)

      expect(axisOf(new Vector3(0, 1, 0)).angleTo(axis)).toBeCloseTo(0)
    })

    it('should turn the face of the plume toward the camera', () => {
      const comet = new Vector3(100, 0, 0)
      const camera = new Vector3(100, 0, 500)

      getPlumeOrientation(new Vector3(0, 1, 0), comet, camera, orientation)

      const toCamera = camera.clone().sub(comet).normalize()

      expect(axisOf(new Vector3(0, 0, 1)).angleTo(toCamera)).toBeCloseTo(0)
    })

    it('should keep the plume square to the camera about its own axis', () => {
      const comet = new Vector3(0, 200, 0)

      getPlumeOrientation(new Vector3(0, 1, 0), comet, new Vector3(300, 200, 0), orientation)

      expect(axisOf(new Vector3(1, 0, 0)).dot(new Vector3(1, 0, 0))).toBeCloseTo(0)
    })

    it('should leave the plume as it was when the camera looks straight down the tail', () => {
      const axis = new Vector3(0, 0, 1)

      expect(
        getPlumeOrientation(axis, new Vector3(0, 0, 100), new Vector3(0, 0, 500), orientation)
      ).toBe(false)
    })
  })

  describe('useFrame()', () => {
    /** The tail lies along this once the comet sits at the start of the square orbit above. */
    const TAIL_AXIS = new Vector3(1, 0, -1).normalize()

    /** Where the comet is placed in the scene, and so how hard it is venting. */
    const WORLD_POSITION = new Vector3(0, 0, 100)

    type Tick = (
      state: { camera: { position: Vector3 }; clock: { getElapsedTime: () => number } },
      delta: number
    ) => void

    /**
     * Stands the three objects the frame loop reaches for behind the rendered elements, which are
     * the DOM's under test rather than three's own.
     */
    const stubBody = (container: HTMLElement) => {
      const group = container.querySelector('group[name="comet"]') as Element
      const tail = group.querySelector('mesh') as Element
      const parent = {
        updateWorldMatrix: vi.fn(),
        getWorldQuaternion: vi.fn((into: Quaternion) => into.identity())
      }

      Object.assign(group, {
        parent,
        getWorldPosition: vi.fn((into: Vector3) => into.copy(WORLD_POSITION)),
        quaternion: new Quaternion()
      })

      Object.assign(tail, {
        scale: { setY: vi.fn() },
        position: { setY: vi.fn() },
        material: { uniforms: { activity: { value: 0 }, elapsed: { value: 0 } } }
      })

      return {
        parent,
        group: group as unknown as { quaternion: Quaternion },
        tail: tail as unknown as {
          scale: { setY: ReturnType<typeof vi.fn> }
          position: { setY: ReturnType<typeof vi.fn> }
          material: { uniforms: { activity: { value: number }; elapsed: { value: number } } }
        }
      }
    }

    /**
     * Runs the frame callback the comet registered, which the mocked `useFrame` only records.
     */
    const advanceFrame = (cameraPosition: Vector3, elapsed = 5) => {
      const { calls } = vi.mocked(useFrame).mock
      const tick = calls[calls.length - 1][0] as unknown as Tick

      tick({ camera: { position: cameraPosition }, clock: { getElapsedTime: () => elapsed } }, 0)
    }

    const renderComet = (bodyPercent?: number) =>
      renderInScene(
        <Comet radius={15} settings={settings} pathVertices={path} bodyPercent={bodyPercent} />
      )

    it('should leave the tail alone until the comet is standing in a scene', () => {
      renderComet(0)

      expect(() => advanceFrame(new Vector3(0, 500, 0))).not.toThrow()
    })

    it('should grow the tail to match how hard the comet is venting', () => {
      const { tail, parent } = stubBody(renderComet(0).container)
      const activity = getActivity(WORLD_POSITION.length(), settings)

      advanceFrame(new Vector3(0, 500, 0))

      expect(parent.updateWorldMatrix).toHaveBeenCalledWith(true, false)
      expect(tail.scale.setY).toHaveBeenCalledWith(activity)
      expect(tail.position.setY).toHaveBeenCalledWith((settings.length * activity) / 2)
    })

    it('should report the venting and the clock to the shader', () => {
      const { tail } = stubBody(renderComet(0).container)

      advanceFrame(new Vector3(0, 500, 0), 12)

      expect(tail.material.uniforms.activity.value).toEqual(
        getActivity(WORLD_POSITION.length(), settings)
      )
      expect(tail.material.uniforms.elapsed.value).toEqual(12)
    })

    it('should turn the plume to face the camera', () => {
      const { group } = stubBody(renderComet(0).container)

      advanceFrame(new Vector3(0, 500, 0))

      expect(group.quaternion.equals(new Quaternion())).toBe(false)
    })

    it('should leave the plume as it was when the camera looks straight down the tail', () => {
      const { group } = stubBody(renderComet(0).container)
      const downTheTail = WORLD_POSITION.clone().add(TAIL_AXIS.clone().multiplyScalar(100))

      advanceFrame(downTheTail)

      expect(group.quaternion.equals(new Quaternion())).toBe(true)
    })

    it('should work in the same vectors from one frame to the next', () => {
      const { tail } = stubBody(renderComet(0).container)

      advanceFrame(new Vector3(0, 500, 0), 1)
      advanceFrame(new Vector3(0, 500, 0), 2)

      expect(tail.scale.setY).toHaveBeenCalledTimes(2)
      expect(tail.material.uniforms.elapsed.value).toEqual(2)
    })

    it('should trail a comet with no place on its orbit from the start of it', () => {
      const { tail } = stubBody(renderComet().container)

      advanceFrame(new Vector3(0, 500, 0))

      expect(tail.scale.setY).toHaveBeenCalledWith(getActivity(WORLD_POSITION.length(), settings))
    })
  })
})
