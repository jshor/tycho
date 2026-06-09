import TWEEN from 'tween.js';
import { Vector3 } from 'three';
import Constants from '../constants';
import OrbitalService from './OrbitalService';
import Gyroscope from '../utils/Gyroscope';
import Scale from '../utils/Scale';

export default class CameraService {

  static CAMERA_INITIAL_POSITION = new Vector3(
      Constants.WebGL.Camera.X,
      Constants.WebGL.Camera.Y,
      Constants.WebGL.Camera.Z
  )

  /**
   * Calculates the min distance from target to camera to avoid collision.
   *
   * @param {Object[]} orbitals - list of orbitals
   * @param {String} targetId - id of active orbital target
   * @param {Number} scale - user-defined planet scale
   * @returns {Number} min distance
   */
  static getMinDistance = (orbitals, targetId, scale) => {
      const target = OrbitalService.getTargetByName(orbitals, targetId);

      if (target) {
          return Scale(target.radius, scale) + Constants.WebGL.Camera.MIN_DISTANCE;
      }
      return 0;
  }
  
  /**
   * Creates an instance of Tween for moving a pivot to a given target.
   *
   * @param {THREE.Vector3} from - starting position
   * @param {THREE.Vector3} to - target position
   * @param {THREE.Object3D} target - new target
   * @param {THREE.Object3D} group - camera pivot
   * @param {Function} cb - callback fn when tween ends
   * @returns {Tween}
   */
  static getPivotTween = (from, to, target, group, cb) => {
      return new TWEEN
          .Tween(from)
          .to(to, Constants.WebGL.Tween.SLOW)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(CameraService.setPivotPosition.bind(this, group, from))
          .onComplete(CameraService.attachToGyroscope.bind(this, target, group, cb))
          .start();
  }

  /**
   * Sets the camera pivot position.
   *
   * @param {THREE.Object3D} group - camera pivot
   * @param {THREE.Vector3} vect - new vector position
   */
  static setPivotPosition = (group, { x, y, z }) => {
      group.position.set(x, y, z);
  }

  /**
   * Returns the world position (i.e., w.r.t. <0>) of the given target.
   *
   * @param {THREE.Object3D} target - object to get world position of
   * @returns {THREE.Vector3} world position
   */
  static getWorldPosition = (target) => {
      target.updateMatrixWorld();

      const matrix = target.matrixWorld;
      const vect = new Vector3();

      vect.setFromMatrixPosition(matrix);

      return vect;
  }

  /**
   * Attaches camera pivot to the global scene at given position.
   *
   * @param {THREE.Scene} scene - scene
   * @param {THREE.Object3D} pivot - camera pivot
   * @param {THREE.Vector3} position - world position
   */
  static attachToWorld = (scene, pivot, position) => {
      scene.add(pivot);
      pivot.position.copy(position);
  }

  /**
   * Attaches camera pivot to target via gyroscope at <0>.
   * The gyroscope keeps the camera level with the ecliptic plane.
   *
   * @param {THREE.Object3D} target - target object
   * @param {THREE.Object3D} pivot - camera pivot
   * @param {Function} callback - callback 
   */
  static attachToGyroscope = (target, pivot, callback) => {
      const gyro = new Gyroscope();

      gyro.add(pivot);
      target.add(gyro);
      pivot.position.set(0, 0, 0);
      callback();
  }
}
