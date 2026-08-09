import { Easing, Tween } from '@tweenjs/tween.js'
import { Vector3, Object3D, Quaternion, Scene as ThreeScene, MathUtils } from 'three'
import { Constants } from '../constants'
import { Gyroscope } from '../elements/gyroscope'
import { tweens } from './tween'
import { Scale, getVisibleRadius } from './scale'

/**
 * Returns the minimum distance the camera may get to the given orbital.
 */
export function getMinDistance(radius: number, aspect: number): number {
  const extent = getVisibleRadius(radius)
  const vertical = MathUtils.degToRad(Constants.WebGL.Camera.FOV)
  const field = Math.min(vertical, 2 * Math.atan(Math.tan(vertical / 2) * aspect))

  return Scale(extent) / Math.sin((field * Constants.WebGL.Camera.FOCUS_FILL) / 2)
}

/**
 * Returns the direction an orbital's sunlit face is watched from as a unit vector.
 */
export function getSunlitHeading(target: Vector3, fallback: Vector3): Vector3 {
  const heading = Constants.WebGL.ORIGIN_POINT.clone().sub(target)
  const tilt = MathUtils.degToRad(Constants.WebGL.Camera.SUNLIT_TILT)

  if (heading.lengthSq() === 0) {
    return fallback.clone().normalize()
  }

  return heading.normalize().applyAxisAngle(Constants.WebGL.SUNLIT_TILT_AXIS, tilt)
}

/**
 * Turns the given heading the given percentage of the way onto another, along the shortest arc.
 */
export function turnHeading(from: Vector3, to: Vector3, progress: number): Vector3 {
  const start = from.clone().normalize()
  const turn = new Quaternion().setFromUnitVectors(start, to.clone().normalize())

  return start.applyQuaternion(new Quaternion().slerp(turn, progress))
}

/**
 * Returns the tween for the camera's pivot from where it sits to the given target.
 */
export function getPivotTween(
  from: Vector3,
  target: Object3D,
  group: Object3D,
  offset: number,
  onMovePosition: (progress: number) => void,
  cb: () => void
): Tween {
  const origin = from.clone()
  const flight = { progress: 0 }

  /**
   * Moves the camera position onto the next target, based on percentage of completion of the movement.
   */
  const moveToNextPosition = () => {
    const to = getWorldPosition(target)
    const covered = getApproach(origin.distanceTo(to), offset, flight.progress)

    setPivotPosition(group, origin.clone().lerp(to, covered))
    onMovePosition(flight.progress)
  }

  return new Tween(flight)
    .group(tweens)
    .to({ progress: 1 }, Constants.WebGL.Tween.SLOW)
    .easing(Easing.Quadratic.InOut)
    .onUpdate(moveToNextPosition)
    .onComplete(() => attachToGyroscope(target, group, cb))
    .start()
}

/**
 * Returns the percentage of the distance covered from the origin to the target.
 */
export function getApproach(distance: number, offset: number, progress: number): number {
  if (distance <= 0) {
    return 1
  }

  const scale = Math.max(offset, Number.EPSILON)
  const range = Math.log1p(distance / scale)
  const remaining = scale * Math.expm1(range * (1 - progress))

  return 1 - remaining / distance
}

/**
 * Moves the given pivot onto the given coordinates.
 */
export function setPivotPosition(
  group: Object3D,
  { x, y, z }: { x: number; y: number; z: number }
): void {
  group.position.set(x, y, z)
}

/**
 * Returns the position of the given object in world space.
 */
export function getWorldPosition(target: Object3D): Vector3 {
  target.updateMatrixWorld()

  const matrix = target.matrixWorld
  const vect = new Vector3()

  vect.setFromMatrixPosition(matrix)

  return vect
}

/**
 * Attaches the given pivot to the scene itself, at the given position.
 */
export function attachToWorld(scene: ThreeScene, pivot: Object3D, position: Vector3): void {
  scene.add(pivot)
  pivot.position.copy(position)
}

/**
 * Attaches the given pivot to the target through a gyroscope that holds its bearing.
 */
export function attachToGyroscope(target: Object3D, pivot: Object3D, callback: () => void): void {
  const gyro = new Gyroscope()

  gyro.add(pivot)
  target.add(gyro)
  pivot.position.set(0, 0, 0)
  callback()
}
