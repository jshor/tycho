import React from 'react'
import { act } from '@testing-library/react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3, MathUtils } from 'three'
import { renderInScene } from '../../test/helpers'
import { useStore } from '../../store'
import { Constants } from '../../constants'
import { Camera, CameraHandle } from '../camera'
import { getNearPlane } from '../../utils/camera'
import { tweens } from '../../utils/tween'
import { Scale } from '../../utils/scale'
import { Controls } from '../../elements/controls'
import { Ambience } from '../../elements/ambience'
import { OrbitalData, Store } from '../../types'

const three = vi.hoisted(() => ({
  camera: {
    name: 'camera',
    isPerspectiveCamera: true,
    near: 0,
    view: null,
    updateProjectionMatrix: vi.fn(),
    setViewOffset: vi.fn(),
    clearViewOffset: vi.fn()
  } as {
    name: string
    position: Vector3
    near: number
    isPerspectiveCamera: boolean
    view: { enabled: boolean; offsetX: number } | null
    updateProjectionMatrix: ReturnType<typeof vi.fn>
    setViewOffset: ReturnType<typeof vi.fn>
    clearViewOffset: ReturnType<typeof vi.fn>
  },
  scene: { getObjectByName: vi.fn(), updateMatrixWorld: vi.fn() },
  gl: { domElement: { nodeName: 'CANVAS' } },
  size: { width: 1000, height: 500 }
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
  startAutoRotate: vi.fn(),
  stopAutoRotate: vi.fn(),
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

vi.mock('../../utils/camera', async (importOriginal) => {
  const {
    getNearPlane,
    getSunlitHeading,
    getViewOffset,
    getViewShift,
    getViewShiftTween,
    setViewShift,
    turnHeading
  } = await importOriginal<typeof import('../../utils/camera')>()

  return {
    ...cameraService,
    getNearPlane,
    getSunlitHeading,
    getViewOffset,
    getViewShift,
    getViewShiftTween,
    setViewShift,
    turnHeading
  }
})

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

/** Vector representing a sun ray. */
const SUNWARD = new Vector3(-1, 0, 0)

/** Distance of the camera to show the target's gibbous phase. */
const TILT = MathUtils.degToRad(Constants.WebGL.Camera.SUNLIT_TILT)

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
    three.camera.near = 0

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
    const pivot = result.container.querySelector('group') as Element

    // The pivot is the rendered element rather than three's own group, and the turn onto the
    // target reads the target's place out of it. It is stood up before the target is set, because
    // a change the camera takes without animation turns onto it there and then.
    Object.assign(pivot, {
      updateMatrixWorld: vi.fn(),
      worldToLocal: vi.fn((point: unknown) => point)
    })

    vi.clearAllMocks()
    act(() =>
      useStore.setState({
        targetId: TARGET_ID,
        target: TARGET,
        // the store hands one over on every target it sets, so the module never sees it unset
        animateTargetChange: true,
        ...state
      })
    )

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

  describe('modalWidth', () => {
    const MODAL_WIDTH = 400
    const duration = Constants.WebGL.Tween.FAST
    const shift = () => (three.camera.view?.enabled ? three.camera.view.offsetX : 0)
    const slide = (part = 1) => {
      act(() => {
        tweens.update(performance.now() + duration * part)
      })
    }
    const openModal = (modalWidth = MODAL_WIDTH) => {
      const result = renderModule({ modalWidth: 0 })

      act(() => useStore.setState({ modalWidth }))

      return result
    }

    beforeEach(() => {
      tweens.removeAll()

      three.camera.view = null
      three.camera.setViewOffset.mockImplementation(
        (fullWidth: number, fullHeight: number, offsetX: number) => {
          three.camera.view = { enabled: true, offsetX }
        }
      )
      three.camera.clearViewOffset.mockImplementation(() => {
        three.camera.view = null
      })
    })

    it('should draw the scene in the middle of the screen while no modal is open', () => {
      renderModule({ modalWidth: 0 })
      slide()

      expect(three.camera.setViewOffset).not.toHaveBeenCalled()
      expect(shift()).toEqual(0)
    })

    it('should carry the scene into the middle of the room an open modal leaves it', () => {
      openModal()
      slide()

      expect(three.camera.setViewOffset).toHaveBeenCalledWith(
        three.size.width,
        three.size.height,
        MODAL_WIDTH / 2,
        0,
        three.size.width,
        three.size.height
      )
      expect(shift()).toEqual(MODAL_WIDTH / 2)
    })

    it('should slide the scene aside rather than jumping it there', () => {
      openModal()
      slide(0.5)

      expect(shift()).toBeGreaterThan(0)
      expect(shift()).toBeLessThan(MODAL_WIDTH / 2)
    })

    it('should carry the scene back onto the middle of the screen once the modal closes', () => {
      openModal()
      slide()

      act(() => useStore.setState({ modalWidth: 0 }))
      slide(0.5)

      expect(shift()).toBeGreaterThan(0)
      expect(shift()).toBeLessThan(MODAL_WIDTH / 2)

      slide()

      expect(shift()).toEqual(0)
    })

    it('should hold the scene still for a modal with the whole screen to itself', () => {
      openModal(three.size.width)
      slide()

      expect(three.camera.setViewOffset).not.toHaveBeenCalled()
      expect(shift()).toEqual(0)
    })

    it('should leave off shifting the scene once the camera leaves', () => {
      const { unmount } = openModal()

      slide(0.5)
      unmount()

      const left = shift()

      slide()

      expect(shift()).toEqual(left)
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

    describe('near plane', () => {
      const { NEAR } = Constants.WebGL.Camera
      const TINY_RADIUS = 11.2667
      const frameAt = (distance: number, radius = TARGET_RADIUS) => {
        renderModule({ target: { radius } as OrbitalData })
        three.camera.position.set(0, 0, distance)
        advanceFrame()
      }

      it('should hold the plane at its default while the camera is far out', () => {
        frameAt(Constants.WebGL.Camera.MAX_DISTANCE)

        expect(three.camera.near).toBe(NEAR)
      })

      it('should draw the plane in as the camera closes on a tiny target', () => {
        frameAt(Scale(TINY_RADIUS) * 3, TINY_RADIUS)

        expect(three.camera.near).toBeLessThan(NEAR)
        expect(three.camera.near).toBe(getNearPlane(Scale(TINY_RADIUS) * 3, TINY_RADIUS))
      })

      it('should keep the plane clear of a tiny target it has closed right in on', () => {
        const distance = Scale(TINY_RADIUS) * 1.5

        frameAt(distance, TINY_RADIUS)

        expect(three.camera.near).toBeLessThan(distance - Scale(TINY_RADIUS))
      })

      it('should rebuild the projection when the plane moves', () => {
        frameAt(Scale(TINY_RADIUS) * 3, TINY_RADIUS)

        expect(three.camera.updateProjectionMatrix).toHaveBeenCalled()
      })

      it('should leave the projection alone while the camera holds still', () => {
        frameAt(Scale(TINY_RADIUS) * 3, TINY_RADIUS)
        three.camera.updateProjectionMatrix.mockClear()

        advanceFrame()

        expect(three.camera.updateProjectionMatrix).not.toHaveBeenCalled()
      })

      it('should hold the plane at its default until a target is chosen', () => {
        renderModule()
        three.camera.position.set(0, 0, Constants.WebGL.Camera.MAX_DISTANCE)

        advanceFrame()

        expect(three.camera.near).toBe(NEAR)
      })
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
      const focusImmediately = (state: Partial<Store> = {}) =>
        renderOnTarget({ animateTargetChange: false, ...state })

      it('should arrive on the target at a stroke, rather than flying there', () => {
        focusImmediately()

        expect(cameraService.getPivotTween).not.toHaveBeenCalled()
        expect(controls.lookToward).toHaveBeenCalledTimes(1)
      })

      it('should land at the framing the target asks for', () => {
        focusImmediately()

        expect(three.camera.position.length()).toBeCloseTo(MIN_DISTANCE)
      })

      it('should land on the side of the target the sun shines on', () => {
        // the target sits out along -z, so the sun on the origin lights the face turned back at it
        cameraService.getWorldPosition.mockReturnValue(new Vector3(0, 0, -100))
        three.camera.position.set(8, 0, 0)

        focusImmediately()

        const heading = three.camera.position.clone().normalize()

        expect(heading.angleTo(new Vector3(0, 0, 1))).toBeCloseTo(TILT)
      })

      it('should finish its turn onto the target rather than leaving it partway round', () => {
        focusImmediately()

        // the turn is spread over the opening fraction of a flight, so arriving at a stroke has
        // to carry it the whole way rather than the sliver of it that fraction would allow
        const [, turned] = controls.lookToward.mock.calls[0]

        expect(turned).toBeGreaterThanOrEqual(1)
      })

      it('should report the new zoom level to the store', () => {
        const changeZoom = vi.fn()

        focusImmediately({ changeZoom })

        expect(changeZoom).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN)
      })

      it("should take on the target's own framing", () => {
        focusImmediately()

        expect(controls.minDistance).toEqual(MIN_DISTANCE)
        expect(controls.level).toEqual(Constants.WebGL.Zoom.MIN)
      })

      it('should orbit the target it lands on', () => {
        focusImmediately()

        expect(controls.startAutoRotate).toHaveBeenCalledWith(
          Constants.WebGL.Camera.AUTOROTATE_SPEED
        )
        expect(controls.lockCameraOntoTarget).toHaveBeenCalledTimes(1)
      })

      it('should hand control back to the viewer straight away', () => {
        focusImmediately()

        expect(useStore.getState().controlsEnabled).toBe(true)
        expect(controls.enabled).toBe(true)
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

      it('should not orbit the target it is still on its way to', () => {
        renderOnTarget()

        // the orbit keeps turning through the flight otherwise, since it does not run off the controls
        expect(controls.stopAutoRotate).toHaveBeenCalledTimes(1)
        expect(controls.startAutoRotate).not.toHaveBeenCalled()
      })

      it('should stop a journey already underway when the target changes again', () => {
        renderOnTarget()

        act(() => useStore.setState({ targetId: OTHER_TARGET_ID, target: OTHER_TARGET }))

        expect(tween.stop).toHaveBeenCalledTimes(1)
      })

      it('should turn the camera toward the target as it travels', () => {
        const { pivot } = renderOnTarget()
        const { TURN_FRACTION } = Constants.WebGL.Camera

        travel().turnTo(TURN_FRACTION / 2)

        expect(controls.lookToward).toHaveBeenCalledWith(expect.anything(), 0.5)
        expect(pivot).toHaveProperty('worldToLocal')
      })

      it('should finish its turn early on, so the target stays in shot the rest of the way', () => {
        renderOnTarget()

        const { turnTo } = travel()
        const asked = () => vi.mocked(controls.lookToward).mock.calls.at(-1)?.[1] as number

        turnTo(Constants.WebGL.Camera.TURN_FRACTION)
        const turned = asked()

        turnTo(0.5)
        const midway = asked()

        turnTo(1)

        expect(turned).toBeGreaterThanOrEqual(1)
        expect(midway).toBeGreaterThanOrEqual(1)
        expect(asked()).toBeGreaterThanOrEqual(1)
      })

      it('should still be turning when it has only just set off', () => {
        renderOnTarget()

        travel().turnTo(0)

        expect(vi.mocked(controls.lookToward).mock.calls.at(-1)?.[1]).toEqual(0)
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

      it('should swing the camera round onto the side of the target the sun shines on', () => {
        cameraService.getWorldPosition.mockReturnValue(new Vector3(100, 0, 0))

        renderOnTarget()
        travel().turnTo(1)

        const heading = controls.camera.position.clone().normalize()

        // stood off the sun's own line for a gibbous phase, but well within the lit half
        expect(heading.angleTo(SUNWARD)).toBeCloseTo(TILT)
        expect(heading.angleTo(SUNWARD)).toBeLessThan(Math.PI / 2)
      })

      it('should swing round over the course of the flight rather than at a stroke', () => {
        cameraService.getWorldPosition.mockReturnValue(new Vector3(100, 0, 0))

        renderOnTarget()

        const { turnTo } = travel()
        const heading = () => controls.camera.position.clone().normalize()

        turnTo(1)
        const arrived = heading()

        turnTo(0)
        const whole = heading().angleTo(arrived)

        turnTo(0.5)

        expect(whole).toBeGreaterThan(0)
        expect(heading().angleTo(arrived)).toBeCloseTo(whole / 2)
      })

      it('should stay where it is for a target sat on the sun itself', () => {
        renderOnTarget()

        travel().turnTo(1)

        expect(controls.camera.position.clone().normalize().z).toBeCloseTo(1)
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

      it('should orbit the target once the camera arrives', () => {
        renderOnTarget()

        act(() => travel().endTween())

        expect(controls.startAutoRotate).toHaveBeenCalledWith(
          Constants.WebGL.Camera.AUTOROTATE_SPEED
        )
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
})
