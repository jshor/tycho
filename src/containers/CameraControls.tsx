import React, { useRef, useEffect } from 'react'
import { Vector3, Group, Camera } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TRANSITION_TIME } from '../constants'
import { Camera as CameraConfig } from '../constants/WebGL'
import { State, store } from '../store/new-store'
import { easeOut } from '../utils/easing'
import Scale from '../utils/Scale'

/** How much of the view a focused body fills: distance = bodyRadius / tan(fov/2)
 *  × this. ~2.5 frames the planet prominently with a little surrounding space. */
const VIEWING_DISTANCE_MARGIN = 2.5

// const getZoom = () => {
  // const { minDistance, maxDistance } = controls.current
  // const currDistance = camera.position.length()
  // const percent = (currDistance - minDistance) / (maxDistance - minDistance)
  // var factor = zoomDistance / currDistance

  // console.log('currDist: ', currDistance, percent, maxDistance)
// }

export class CameraControlsHandler {
  /** The dolly group, for holding the camera */
  group = new Group()
  /** Scene primary camera */
  camera: Camera
  /** Placeholder camera for computing the next-frame position */
  placeholderCamera: Camera
  /** Mouse/keyboard/touch controls for orbiting the camera around focused body */
  controls: OrbitControls
  /** Start time for a focus transition */
  startTime = 0
  /** Expected end time for a focus transition */
  endTime = 0
  /** Start position for a focus transition */
  startPosition = new Vector3()
  /** Expected end position for a focus transition */
  endPosition = new Vector3()
  /** Unit vector representing the difference of zoom during a transition */
  zoomVector = new Vector3()
  /** Distance the click-zoom settles at: close enough to clearly view the
   *  focused body. */
  viewingDistance = 0

  /**
   * Constructor.
   *
   * @param {Camera} camera - the scene camera
   * @param {HTMLElement} domElement - DOM element to attach `OrbitControls` to
   */
  constructor (camera: Camera, domElement: HTMLElement) {
    this.camera = camera
    this.placeholderCamera = camera?.clone()
    this.controls = new OrbitControls(this.placeholderCamera, domElement)
    this.controls.enableDamping = true
    this.controls.maxDistance = CameraConfig.MAX_DISTANCE
  }

  /**
   * Adds the camera to the given dolly group.
   * This group will be the point that is animated during focus transitions.
   *
   * @param {Group} [group = CameraControlsHandler.group]
   */
  public addCameraToDolly = (group: Group = this.group) => {
    this.group = group
    this.group.add(this.camera)
  }

  /**
   * Subscribes to relevant store changes transiently (i.e., w/o component re-render).
   */
  subscribe = () => {
    store.subscribe(s => this.updateActivePosition(s), (s: State) => s)
  }

  updateActivePosition = (state: State | null) => {
    const v = state?.positions[state.focusedOrbitalId]?.world
    const isChangingFocus = state?.isChangingFocus
    if (!state) return

    if (isChangingFocus) {
      if (this.startTime && this.endTime) {
        this.moveTowardDestination()
      } else {
        // stop the zoom a few km above the focused body's surface: take its real
        // km radius plus that altitude and convert to scene units with the current
        // size scale (so it tracks the body's drawn size), not its raw km radius
        const focusedRadius = state.orbitals[state.focusedOrbitalId]?.radius ?? 0
        const minAltitude = focusedRadius + CameraConfig.MIN_SURFACE_ALTITUDE_KM
        this.controls.minDistance = Scale(minAltitude, state.scale)

        // settle close enough to clearly view the focused body
        this.viewingDistance = this.viewDistanceFor(state)

        this.zoomIn()
        this.setFocusedOrbital(state.focusedOrbitalPosition)
      }
    } else {
      this.group.position.copy(v || new Vector3())
    }

    this.updateZoom()
  }

  /**
   * Distance from which the focused body fills a good portion of the view, given
   * the perspective FOV — close enough to actually see the planet. Never closer
   * than the surface clearance.
   */
  viewDistanceFor = (state: State): number => {
    const focused = state.orbitals[state.focusedOrbitalId]
    if (!focused) return this.controls.minDistance * 2

    // frame the body's drawn disc (scene units), so the planet is clearly visible
    const bodyRadius = Scale(focused.radius, state.scale)
    const halfFov = (CameraConfig.FOV * Math.PI) / 180 / 2
    const distance = (bodyRadius / Math.tan(halfFov)) * VIEWING_DISTANCE_MARGIN

    return Math.max(distance, this.controls.minDistance * 2)
  }

  /**
   * Calls update methods according to current frame parameters.
   */
  onFrameUpdate = () => {
    this.camera.copy(this.placeholderCamera as any)
    this.controls.update()
  }

  /**
   * Defines the start and destination vectors for transitioning camera/dolly focus to a new object.
   */
  setFocusedOrbital = (v: Vector3 = new Vector3()) => {
    // set the start and end vectors for the camera's dolly and zoom
    this.startPosition = this.group.position.clone()
    this.endPosition = v
      .clone()
      .sub(this.startPosition)

    // set the animation start time and deadline
    this.startTime = Date.now()
    this.endTime = this.startTime + TRANSITION_TIME
  }

  /**
   * Increments the camera dolly/zoom toward their destination vectors.
   * Once it's completed moving, it resets the vectors and informs the store that it's done.
   */
  moveTowardDestination = () => {
    const duration = this.endTime - this.startTime
    const elapsed = (Date.now() - this.startTime) / duration
    const scalar = easeOut(elapsed)

    this.controls.enabled = false

    if (elapsed < 1) {
      // move the dolly to the next animated position
      const nextPosition = this
        .endPosition
        .clone()
        .multiplyScalar(scalar)
        .add(this.startPosition)

      this.group.position.copy(nextPosition)

      // zoom in/out closer to the destination zoom level
    } else {
      this.controls.enabled = true
      // this.isChangingFocus = false
      this.startTime = 0
      this.endTime = 0

      store
        .getState()
        .setIsChangingFocus(false)
    }
  }

  zoomStartTime = 0

  zoomLevel = 1

  zoomIn = () => {
    if (this.zoomStartTime !== 0) return

    this.zoomVector = this
      .placeholderCamera
      .position
      .clone()

    this.zoomStartTime = Date.now()
  }

  updateZoom = () => {
    this.zoomLevel = this.zoomVector.length() / (this.controls.maxDistance - this.controls.minDistance)

    if (this.zoomStartTime === 0) return

    const elapsed = (Date.now() - this.zoomStartTime) / TRANSITION_TIME
    const scalar = easeOut(elapsed)

    if (elapsed < 1) {
      const nextZoomVector = this
        .zoomVector
        .clone()
        .multiplyScalar(1 - scalar)
        .clampLength(this.viewingDistance, this.controls.maxDistance)

      this.placeholderCamera.position.copy(nextZoomVector)
    } else {
      this.zoomStartTime = 0
    }
  }
}

const CameraControls = () => {
  const { camera, gl } = useThree()
  const groupRef = useRef<Group>()
  const handler = new CameraControlsHandler(camera, gl?.domElement)

  useEffect(() => {
    handler.subscribe()
    handler.addCameraToDolly(groupRef.current)
  }, [camera])

  useFrame(handler.onFrameUpdate)

  return (
    <mesh ref={groupRef as any}>
      {/* <boxGeometry attach="geometry" args={[100, 100, 100]} /> */}
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

export default CameraControls
