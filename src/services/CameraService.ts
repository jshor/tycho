import TWEEN, { Tween } from 'tween.js'
import { Vector3, Object3D, Scene as ThreeScene, MathUtils } from 'three'
import Constants from '../constants'
import OrbitalService from './OrbitalService'
import Gyroscope from '../utils/Gyroscope'
import Scale, { getVisibleRadius } from '../utils/Scale'
import { OrbitalData } from '../types'

export default class CameraService {
  static CAMERA_INITIAL_POSITION: Vector3 = new Vector3(
    Constants.WebGL.Camera.X,
    Constants.WebGL.Camera.Y,
    Constants.WebGL.Camera.Z
  )

  /**
   * Returns the minimum distance the camera may get to the given orbital.
   */
  static getMinDistance = (
    orbitals: OrbitalData[],
    targetId: string,
    aspect: number = 1
  ): number => {
    const target = OrbitalService.getTargetByName(orbitals, targetId)

    if (!target) {
      return Constants.WebGL.Camera.MIN_DISTANCE
    }

    // floor the radius so the camera stops outside the inflated body of a small orbital
    const extent = Math.max(
      getVisibleRadius(target.radius),
      target.rings?.outerRadius ?? 0
    )

    // the field of view is the vertical one, so a screen taller than it is wide is narrower than
    // the camera's own field and is what the orbital actually has to fit inside
    const vertical = MathUtils.degToRad(Constants.WebGL.Camera.FOV)
    const field = Math.min(vertical, 2 * Math.atan(Math.tan(vertical / 2) * aspect))

    return Scale(extent) / Math.sin((field * Constants.WebGL.Camera.FOCUS_FILL) / 2)
  }

  static getPivotTween = (
    from: Vector3,
    to: Vector3,
    target: Object3D,
    group: Object3D,
    cb: () => void
  ): Tween => {
    return new TWEEN.Tween(from)
      .to(to, Constants.WebGL.Tween.SLOW)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(CameraService.setPivotPosition.bind(CameraService, group, from))
      .onComplete(CameraService.attachToGyroscope.bind(CameraService, target, group, cb))
      .start()
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
