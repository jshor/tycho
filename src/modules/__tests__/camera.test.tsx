import React from 'react'
import { act } from '@testing-library/react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { renderInScene } from '../../test/helpers'
import { useStore } from '../../store'
import { Constants } from '../../constants'
import { Camera, CameraHandle, focusCameraImmediately } from '../camera'
import { Controls } from '../../elements/controls'
import { Ambience } from '../../elements/ambience'
import { OrbitalData, Store } from '../../types'

const three = vi.hoisted(() => ({
  camera: { name: 'camera' } as { name: string; position: Vector3 },
  scene: { getObjectByName: vi.fn(), updateMatrixWorld: vi.fn() },
  gl: { domElement: { nodeName: 'CANVAS' } }
}))

three.camera.position = new Vector3(0, 0, 1)

const controls = vi.hoisted(() => ({
  camera: three.camera,
  dispose: vi.fn(),
  zoom: vi.fn(),
  tweenZoom: vi.fn(),
  cancelTween: vi.fn(),
  lockCameraOntoTarget: vi.fn(),
  lookToward: vi.fn(),
  resetLook: vi.fn(),
  update: vi.fn(),
  faceTarget: vi.fn(),
  getZoomVector: vi.fn((vector: Vector3, scalar: number) =>
    vector.clone().normalize().multiplyScalar(scalar)
  ),
  autoRotate: false,
  minDistance: 7,
  level: 50,
  enabled: true
}))

const ambience = vi.hoisted(() => ({
  setVolume: vi.fn()
}))

const cameraService = vi.hoisted(() => ({
  CAMERA_INITIAL_POSITION: { toArray: () => [0, 0, 1000] },
  getMinDistance: vi.fn(),
  getWorldPosition: vi.fn(),
  attachToWorld: vi.fn(),
  attachToGyroscope: vi.fn(),
  getPivotTween: vi.fn()
}))

vi.mock('../../elements/ambience', () => ({
  // eslint-disable-next-line prefer-arrow-callback
  Ambience: vi.fn(function () {
    return ambience
  })
}))

vi.mock('../../elements/controls', () => ({
  // eslint-disable-next-line prefer-arrow-callback
  Controls: vi.fn(function () {
    return controls
  })
}))

vi.mock('../../utils/camera', () => cameraService)

vi.mock('@react-three/fiber', async () => {
  const React = (await import('react')).default

  return {
    Canvas: ({ children }: { children?: React.ReactNode }): React.ReactNode =>
      React.createElement('svg', null, children),
    useThree: () => three,
    useFrame: vi.fn()
  }
})

/** The aspect ratio the camera renders at under test. */
const RATIO = 1.5

/** The orbital the camera is sent to. */
const TARGET_ID = 'mars'

/** The orbital the camera is sent to once it is already on its way somewhere. */
const OTHER_TARGET_ID = 'venus'

/** The radius of the orbital the camera is sent to, which frames it once it arrives. */
const TARGET_RADIUS = 3390

/** The orbitals the camera reads its target's size out of. */
const orbitalData = [
  { id: TARGET_ID, radius: TARGET_RADIUS },
  { id: OTHER_TARGET_ID, radius: 6052 }
] as OrbitalData[]

/** The orbital the camera is sent to, as the store hands it over alongside its ID. */
const [TARGET, OTHER_TARGET] = orbitalData

/** The distance the camera is framed at once it arrives, from `cameraService.getMinDistance`. */
const MIN_DISTANCE = 9

describe('Camera Module', () => {
  /** The tween the pivot travels on, which the module holds on to so it can stop it. */
  let tween: { stop: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()

    controls.autoRotate = false
    controls.enabled = true
    controls.minDistance = 7
    controls.level = 50
    three.camera.position.set(0, 0, 1)

    tween = { stop: vi.fn() }

    cameraService.getMinDistance.mockReturnValue(MIN_DISTANCE)
    cameraService.getWorldPosition.mockReturnValue(new Group().position)
    cameraService.getPivotTween.mockReturnValue(tween)
    three.scene.getObjectByName.mockReturnValue(undefined)
  })

  const renderModule = (state: Partial<Store> = {}, ref?: React.Ref<CameraHandle>) => {
    return renderInScene(<Camera ref={ref} ratio={RATIO} />, { orbitalData, ...state })
  }

  const renderOnTarget = (state: Partial<Store> = {}) => {
    const target = new Group()

    three.scene.getObjectByName.mockReturnValue(target)

    const result = renderModule()

    vi.clearAllMocks()
    act(() => useStore.setState({ targetId: TARGET_ID, target: TARGET, ...state }))

    const pivot = result.container.querySelector('group') as Element

    // the pivot is the rendered element rather than three's own group, and the travel reads
    // the target's place out of it
    Object.assign(pivot, { worldToLocal: vi.fn((point: unknown) => point) })

    return { ...result, target, pivot }
  }

  /** The arguments the module handed the pivot tween, which drive the travel. */
  const travel = () => {
    const [, , , minDistance, turnTo, endTween] = cameraService.getPivotTween.mock.calls[0]

    return {
      minDistance: minDistance as number,
      turnTo: turnTo as (progress: number) => void,
      endTween: endTween as () => void
    }
  }

  /** Runs the frame callback the camera registered, which the mocked `useFrame` only records. */
  const advanceFrame = () => {
    const { calls } = vi.mocked(useFrame).mock
    const tick = calls[calls.length - 1][0] as unknown as (state: unknown, delta: number) => void

    tick(null, 0)
  }

  describe('render()', () => {
    it('should render the pivot the camera swings on', () => {
      const { container } = renderModule()

      expect(container.querySelector('group')).not.toBeNull()
    })

    it('should hand its controls out through its ref', () => {
      const ref = React.createRef<CameraHandle>()

      renderModule({}, ref)

      expect(ref.current?.controls).toBe(controls)
    })
  })

  describe('controls', () => {
    it('should build the controls on the camera and the canvas', () => {
      renderModule()

      expect(Controls).toHaveBeenCalledWith(three.camera, three.gl.domElement)
    })

    it('should dispose of the controls once the camera leaves', () => {
      const { unmount } = renderModule()

      unmount()

      expect(controls.dispose).toHaveBeenCalledTimes(1)
    })

    it('should zoom the controls to the level in the store', () => {
      renderModule({ zoom: 42 })

      expect(controls.zoom).toHaveBeenCalledWith(42)
    })

    it('should leave the zoom alone until a level is set', () => {
      renderModule()

      expect(controls.zoom).not.toHaveBeenCalled()
    })

    it('should orbit the target on its own when the store asks it to', () => {
      renderModule({ isAutoOrbitEnabled: true })

      expect(controls.autoRotate).toBe(true)
    })

    it('should stop orbiting on its own when the store asks it to', () => {
      controls.autoRotate = true

      renderModule({ isAutoOrbitEnabled: false })

      expect(controls.autoRotate).toBe(false)
    })

    it('should frame the target no matter how large it is', () => {
      renderOnTarget()

      expect(cameraService.getMinDistance).toHaveBeenCalledWith(TARGET_RADIUS, RATIO)
    })

    it('should leave the framing alone for a target that is not in the scene', () => {
      renderModule()

      act(() => useStore.setState({ targetId: TARGET_ID }))

      expect(cameraService.getMinDistance).not.toHaveBeenCalled()
    })

    it('should leave the framing alone for a target whose size is unknown', () => {
      three.scene.getObjectByName.mockReturnValue(new Group())

      renderModule()

      act(() =>
        useStore.setState({ targetId: TARGET_ID, target: { id: TARGET_ID } as OrbitalData })
      )

      expect(cameraService.getMinDistance).not.toHaveBeenCalled()
      expect(cameraService.getPivotTween).not.toHaveBeenCalled()
    })
  })

  describe('ambience', () => {
    it('should sound the ambience through the camera', () => {
      renderModule()

      expect(Ambience).toHaveBeenCalledWith(three.camera)
    })

    it('should set the volume the user chose', () => {
      renderModule({ volume: 0.5 })

      expect(ambience.setVolume).toHaveBeenCalledWith(0.5)
    })

    it('should leave the volume alone until one is chosen', () => {
      renderModule()

      expect(ambience.setVolume).not.toHaveBeenCalled()
    })

    it('should leave the volume alone when it is not a number to set', () => {
      renderModule({ volume: Infinity })

      expect(ambience.setVolume).not.toHaveBeenCalled()
    })
  })

  describe('useFrame()', () => {
    it('should keep the controls and the scene up to date each frame', () => {
      renderModule()

      advanceFrame()

      expect(controls.update).toHaveBeenCalledTimes(1)
      expect(controls.faceTarget).toHaveBeenCalledTimes(1)
      expect(three.scene.updateMatrixWorld).toHaveBeenCalled()
    })
  })

  describe('targetId', () => {
    it('should stay where it is until a target is chosen', () => {
      renderModule()

      expect(cameraService.getWorldPosition).not.toHaveBeenCalled()
      expect(cameraService.attachToGyroscope).not.toHaveBeenCalled()
    })

    it('should stay where it is while the target is yet to reach the scene', () => {
      renderModule({ targetId: TARGET_ID })

      expect(cameraService.getPivotTween).not.toHaveBeenCalled()
      expect(cameraService.attachToGyroscope).not.toHaveBeenCalled()
    })

    describe('without animation', () => {
      it('should dolly straight in on the target', () => {
        const { target, pivot } = renderOnTarget({ animateTargetChange: false })

        expect(cameraService.attachToGyroscope).toHaveBeenCalledWith(
          target,
          pivot,
          expect.any(Function)
        )
        expect(controls.zoom).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN)
        expect(cameraService.getPivotTween).not.toHaveBeenCalled()
      })

      it('should report the new zoom level to the store', () => {
        const changeZoom = vi.fn()

        renderOnTarget({ animateTargetChange: false, changeZoom })

        expect(changeZoom).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN)
      })
    })

    describe('with animation', () => {
      it('should travel the pivot across to the target', () => {
        const { target, pivot } = renderOnTarget()

        expect(cameraService.attachToWorld).toHaveBeenCalledWith(
          three.scene,
          pivot,
          expect.anything()
        )
        expect(cameraService.getPivotTween).toHaveBeenCalledWith(
          expect.anything(),
          target,
          pivot,
          MIN_DISTANCE, // the new target's own minimum distance, from cameraService.getMinDistance
          expect.any(Function),
          expect.any(Function)
        )
      })

      it('should let the camera move freely while it travels, however close it already sits', () => {
        renderOnTarget()

        // a target already larger on screen than the framing allows would otherwise be shoved away
        expect(controls.minDistance).toEqual(0)
      })

      it('should not leave the departing target before the flight has even begun', () => {
        renderOnTarget()
        expect(controls.camera.position.length()).toBeCloseTo(1)
      })

      it('should not lean on the level-based zoom, since the flight itself closes the distance', () => {
        renderOnTarget()

        expect(controls.tweenZoom).not.toHaveBeenCalled()
      })

      it('should hold the camera still while it travels', () => {
        renderOnTarget()

        expect(useStore.getState().controlsEnabled).toBe(false)
        expect(useStore.getState().playing).toBe(false)
        expect(controls.enabled).toBe(false)
      })

      it('should stop a journey already underway when the target changes again', () => {
        renderOnTarget()

        act(() => useStore.setState({ targetId: OTHER_TARGET_ID, target: OTHER_TARGET }))

        expect(tween.stop).toHaveBeenCalledTimes(1)
      })

      it('should turn the camera toward the target as it travels', () => {
        const { pivot } = renderOnTarget()

        travel().turnTo(0.5)

        expect(controls.lookToward).toHaveBeenCalledWith(expect.anything(), 0.5)
        expect(pivot).toHaveProperty('worldToLocal')
      })

      it('should close the camera in on the new target gradually, not at a stroke', () => {
        renderOnTarget()

        const { turnTo } = travel()

        turnTo(0)
        const justSetOff = controls.camera.position.length()

        turnTo(0.5)
        const halfway = controls.camera.position.length()

        turnTo(1)
        const arrived = controls.camera.position.length()

        // (0, 0, 1) leaving, the new target's own framing arriving
        expect(justSetOff).toBeCloseTo(1)
        expect(arrived).toBeCloseTo(MIN_DISTANCE)
        expect(halfway).toBeGreaterThan(Math.min(justSetOff, arrived))
        expect(halfway).toBeLessThan(Math.max(justSetOff, arrived))
      })

      it('should not turn a camera that has left the scene', () => {
        const { unmount } = renderOnTarget()
        const { turnTo } = travel()

        unmount()
        turnTo(0.5)

        expect(controls.lookToward).not.toHaveBeenCalled()
      })

      it('should hand control back even once the camera has left the scene', () => {
        const { unmount } = renderOnTarget()
        const { endTween } = travel()

        unmount()

        expect(() => act(() => endTween())).not.toThrow()
        expect(useStore.getState().controlsEnabled).toBe(true)
      })

      it('should hand control back once the camera arrives', () => {
        renderOnTarget()

        act(() => travel().endTween())

        expect(controls.resetLook).toHaveBeenCalledTimes(1)
        expect(controls.lockCameraOntoTarget).toHaveBeenCalledTimes(1)
        expect(useStore.getState().controlsEnabled).toBe(true)
        expect(useStore.getState().playing).toBe(true)
        expect(controls.enabled).toBe(true)
      })

      it("should take on the target's own framing once the camera arrives", () => {
        const changeZoom = vi.fn()

        renderOnTarget({ changeZoom })

        act(() => travel().endTween())

        expect(controls.minDistance).toEqual(MIN_DISTANCE)
        expect(controls.level).toEqual(Constants.WebGL.Zoom.MIN)
        expect(changeZoom).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN)
      })
    })
  })

  describe('focusCameraImmediately()', () => {
    it('should attach to the target and zoom fully in without a tween', () => {
      const target = new Group()
      const pivot = new Group()
      const changeZoom = vi.fn()

      focusCameraImmediately(target, pivot, controls as unknown as Controls, changeZoom)

      expect(controls.cancelTween).toHaveBeenCalledTimes(1)
      expect(cameraService.attachToGyroscope).toHaveBeenCalledWith(
        target,
        pivot,
        expect.any(Function)
      )
      expect(controls.resetLook).toHaveBeenCalledTimes(1)
      expect(controls.zoom).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN)
      expect(changeZoom).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN)
      expect(cameraService.getPivotTween).not.toHaveBeenCalled()
    })

    it('should get by without controls or a zoom to report to', () => {
      const target = new Group()
      const pivot = new Group()

      expect(() => focusCameraImmediately(target, pivot, null)).not.toThrow()
      expect(cameraService.attachToGyroscope).toHaveBeenCalledTimes(1)
    })
  })
})
