import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Easing, Tween } from '@tweenjs/tween.js'
import { Constants } from '../constants'
import { tweens } from '../utils/tween'

export class Controls extends OrbitControls {
  camera: THREE.Camera
  level: number
  tweenData: { level: number }
  tweenBase?: Tween
  tweenDone: ((level: number) => void) | undefined
  lookMatrix: THREE.Matrix4 = new THREE.Matrix4()

  /** Current matrix rotation of the lookAt target. */
  lookRotation: THREE.Quaternion = new THREE.Quaternion()

  /** The active focus point of the camera. */
  focus: THREE.Vector3 = new THREE.Vector3()

  /** The point at which the camera was previously looking (i.e., the previous target's lookAt). */
  lookOrigin: THREE.Vector3 = new THREE.Vector3()

  /** Percentage of completion [0, 1] of the camera's turn from the previous target to its next focus. */
  lookPercentCompleted: number = 0

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    super(camera, domElement)

    this.camera = camera
    this.enabled = true
    this.enableZoom = false
    this.enablePan = false
    this.touches.TWO = null // two fingers are reserved for custom pinch-to-zoom only
    this.level = Constants.WebGL.Zoom.MAX
    this.minDistance = Constants.WebGL.Camera.MIN_DISTANCE
    this.maxDistance = Constants.WebGL.Camera.MAX_DISTANCE
  }

  /**
   * Reorients the camera to look at its pivot's origin of its orbital space
   * (i.e., within its own local coordinate system, not the solar one).
   */
  faceTarget = (): void => {
    const { position, up, quaternion } = this.camera

    if (position.distanceToSquared(this.lookOrigin) > 0) {
      // reorient the camera to look at the origin first
      this.lookMatrix.lookAt(position, this.lookOrigin, up)
      quaternion.setFromRotationMatrix(this.lookMatrix)
    }

    if (this.lookPercentCompleted > 0 && position.distanceToSquared(this.focus) > 0) {
      // move the camera to reorient toward the new target (this.focus)
      this.lookMatrix.lookAt(position, this.focus, up)
      this.lookRotation.setFromRotationMatrix(this.lookMatrix)
      quaternion.slerp(this.lookRotation, this.lookPercentCompleted)
    }
  }

  /**
   * Locks the camera onto the next target (or toward the origin if not looking at anything).
   */
  lockCameraOntoTarget = (): void => {
    if (this.lookPercentCompleted > 0) {
      this.lookOrigin
        .set(0, 0, -1)
        .applyQuaternion(this.camera.quaternion)
        .multiplyScalar(this.maxDistance)
        .add(this.camera.position)
    } else {
      this.lookOrigin.copy(Constants.WebGL.ORIGIN_POINT)
    }

    this.lookPercentCompleted = 0
  }

  /**
   * Turns the camera by the given percentage toward the given point.
   */
  lookToward = (point: THREE.Vector3, percent: number): void => {
    this.focus.copy(point)
    this.lookPercentCompleted = THREE.MathUtils.smoothstep(percent, 0, 1)
  }

  /**
   * Frames the camera back on the origin of its own pivot, wherever that pivot now sits.
   */
  resetLook = (): void => {
    this.focus.copy(Constants.WebGL.ORIGIN_POINT)
    this.lookOrigin.copy(Constants.WebGL.ORIGIN_POINT)
    this.lookPercentCompleted = 0
  }

  zoom = (level: number): void => {
    if (this.level !== level) {
      this.pan(level)
      this.level = level
    }
  }

  /**
   * Returns the zoom level by the given wheel delta.
   */
  getZoomDelta = (delta: number): number => {
    const zoom = this.level + delta / Constants.UI.WHEEL_DELTA_DIVISOR

    return THREE.MathUtils.clamp(zoom, Constants.WebGL.Zoom.MIN, Constants.WebGL.Zoom.MAX)
  }

  /**
   * Returns how far out the camera is at the given zoom level.
   *
   * The distance grows geometrically with the level
   * (i.e., speed of zoom incrememnts increases as the camera moves out).
   */
  getZoomDistance = (level: number): number => {
    const min = Math.max(this.minDistance, Number.EPSILON)
    const max = Math.max(this.maxDistance, min)
    const percent = THREE.MathUtils.clamp(level / Constants.WebGL.Zoom.MAX, 0, 1)

    return min * Math.pow(max / min, percent)
  }

  /**
   * Pans the camera to the given zoom level.
   */
  pan = (level: number): void => {
    const position = this.camera.position

    position.copy(this.getZoomVector(position, this.getZoomDistance(level)))
  }

  getZoomVector = (vector: THREE.Vector3, scalar: number): THREE.Vector3 => {
    return vector.clone().normalize().multiplyScalar(scalar)
  }

  getDistance = (): number => {
    return this.maxDistance - this.minDistance
  }

  enable = (): void => {
    this.enabled = true
  }

  disable = (): void => {
    this.enabled = false
  }

  startAutoRotate = (speed: number): void => {
    this.autoRotate = true
    this.autoRotateSpeed = speed
  }

  stopAutoRotate = (): void => {
    this.autoRotate = false
  }

  endTween = (): void => {
    delete this.tweenData
    delete this.tweenBase
  }

  cancelTween = (): void => {
    if (this.tweenBase) {
      this.tweenBase.stop()
      this.endTween()
    }
  }

  updateTween = (): void => {
    this.zoom(this.tweenData.level)
  }

  completeTween = (): void => {
    if (this.tweenDone) {
      this.tweenDone(this.level)
    }
    this.endTween()
  }

  /**
   * Dollies the camera to the given zoom level (with easing).
   */
  tweenZoom = (level: number, onDone: (level: number) => void): void => {
    this.cancelTween()

    this.tweenDone = onDone
    this.tweenData = { level: this.level }

    this.tweenBase = new Tween(this.tweenData)
      .group(tweens)
      .easing(Easing.Quadratic.InOut)
      .to({ level }, Constants.WebGL.Tween.SLOW)
      .onUpdate(this.updateTween)
      .onComplete(this.completeTween)
      .start()
  }
}
