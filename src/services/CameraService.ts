import { Easing, Tween } from '@tweenjs/tween.js'
import { Vector3, Object3D, Scene as ThreeScene, MathUtils } from 'three'
import { Constants } from '../constants'
import { OrbitalService } from './OrbitalService'
import { Gyroscope } from '../utils/Gyroscope'
import { tweens } from '../utils/Tween'
import { Scale, getVisibleRadius } from '../utils/Scale'
import { OrbitalData } from '../types'

export class CameraService {
  static CAMERA_INITIAL_POSITION: Vector3 = new Vector3(
    Constants.WebGL.Camera.X,
    Constants.WebGL.Camera.Y,
    Constants.WebGL.Camera.Z
  )

  /**
   * Returns the minimum distance the camera may get to the given orbital.
   */
  static getMinDistance = (
    radius: number,
    aspect: number
  ): number => {
    const extent = getVisibleRadius(radius)
    const vertical = MathUtils.degToRad(Constants.WebGL.Camera.FOV)
    const field = Math.min(vertical, 2 * Math.atan(Math.tan(vertical / 2) * aspect))

    return Scale(extent) / Math.sin((field * Constants.WebGL.Camera.FOCUS_FILL) / 2)
  }

  /**
   * Returns the tween for the camera's pivot from where it sits to the given target.
   */
  static getPivotTween = (
    from: Vector3,
    target: Object3D,
    group: Object3D,
    offset: number,
    onMovePosition: (progress: number) => void,
    cb: () => void
  ): Tween => {
    const origin = from.clone()
    const flight = { progress: 0 }

    /**
     * Moves the camera position onto the next target, based on percentage of completion of the movement.
     */
    const moveToNextPosition = () => {
      const to = CameraService.getWorldPosition(target)
      const covered = CameraService.getApproach(origin.distanceTo(to), offset, flight.progress)

      CameraService.setPivotPosition(group, origin.clone().lerp(to, covered))
      onMovePosition(flight.progress)
    }

    return new Tween(flight)
      .group(tweens)
      .to({ progress: 1 }, Constants.WebGL.Tween.SLOW)
      .easing(Easing.Quadratic.InOut)
      .onUpdate(moveToNextPosition)
      .onComplete(CameraService.attachToGyroscope.bind(CameraService, target, group, cb))
      .start()
  }

  /**
   * Returns the percentage of the distance covered from the origin to the target.
   */
  static getApproach = (distance: number, offset: number, progress: number): number => {
    if (distance <= 0) {
      return 1
    }

    const scale = Math.max(offset, Number.EPSILON)
    const range = Math.log1p(distance / scale)
    const remaining = scale * Math.expm1(range * (1 - progress))

    return 1 - remaining / distance
  }

  static setPivotPosition = (
    group: Object3D,
    { x, y, z }: { x: number; y: number; z: number }
  ): void => {
    group.position.set(x, y, z)
  }

  static getWorldPosition = (target: Object3D): Vector3 => {
    target.updateMatrixWorld()

    const matrix = target.matrixWorld
    const vect = new Vector3()

    vect.setFromMatrixPosition(matrix)

    return vect
  }

  static attachToWorld = (scene: ThreeScene, pivot: Object3D, position: Vector3): void => {
    scene.add(pivot)
    pivot.position.copy(position)
  }

  static attachToGyroscope = (target: Object3D, pivot: Object3D, callback: () => void): void => {
    const gyro = new Gyroscope()

    gyro.add(pivot)
    target.add(gyro)
    pivot.position.set(0, 0, 0)
    callback()
  }
}
