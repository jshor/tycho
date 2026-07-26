import TWEEN from 'tween.js'
import { Vector3, Object3D, Scene as ThreeScene } from 'three'
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

  static getMinDistance = (orbitals: OrbitalData[], targetId: string, scale: number): number => {
    const target = OrbitalService.getTargetByName(orbitals, targetId)

    if (target) {
      // flooor the radius so the camera stops outside the inflated body of a small
      // orbital (see getVisibleRadius) instead of clipping it
      return Scale(getVisibleRadius(target.radius), scale) + Constants.WebGL.Camera.MIN_DISTANCE
    }
    return 0
  }

  static getPivotTween = (
    from: Vector3,
    to: Vector3,
    target: Object3D,
    group: Object3D,
    cb: () => void
  ): any => {
    return new (TWEEN as any).Tween(from)
      .to(to, Constants.WebGL.Tween.SLOW)
      .easing((TWEEN as any).Easing.Quadratic.Out)
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
    ;(target as any).updateMatrixWorld()

    const matrix = (target as any).matrixWorld
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
