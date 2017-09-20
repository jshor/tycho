import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import TWEEN from 'tween.js';
import Constants from '../constants';

export default class Controls extends OrbitControls(THREE) {

  constructor(camera, domElement) {
    super(camera, domElement);

    this.camera = camera;
    this.level = 100;
    this.enabled = true;
    this.enableZoom = false;
    this.enablePan = false;
    this.minDistance = Constants.WebGL.Camera.MIN_DISTANCE;
    this.maxDistance = Constants.WebGL.Camera.MAX_DISTANCE;
  }

  /**
   * Change zoom. Overrides the existing zoom tween in progress.
   *
   * @param {level} level - percentage of desired zoom level [0,100]
   */
  zoom = (level) => {
    if(this.level !== level) {
      this.pan(level / 100);
      this.level = level;
    }
  }

  /**
   * Calculates the zoom percentage from the given mousewheel delta.
   *
   * @param {Number} delta - mousewheel delta
   * @returns {Number} new zoom level
   */
  getZoomDelta = (delta) => {
    let zoom = this.level;
    
    zoom += (delta / Constants.UI.WHEEL_DELTA_DIVISOR);
    zoom = Math.max(zoom, 1);
    zoom = Math.min(zoom, 100);
   
    return zoom;
  }

  /**
   * Sets the current camera position to the scaled zoom vector.
   *
   * @param {Number} percent - percentage of zoom [0,1]
   */
  pan = (percent) => {
    let p = this.camera.position;
    let v = this.getZoomVector(p, percent);
    
    p.set(v.x, v.y, v.z);
  }

  /**
   * Returns the current vector scaled to the desired zoom.
   *
   * @param {Vector3} v - current position vector
   * @param {Number} p - percentage of zoom [0,1]
   * @returns {Vector3}
   */
  getZoomVector = (v, p) => {
    return v
      .clone()
      .normalize()
      .multiplyScalar(
        this.maxDistance * p
      );
  }

  /**
   * Returns the distance between <0> and current camera position.
   * @return {Number} distance
   */
  getDistance = () => {
    return this.maxDistance - this.minDistance;
  }

  /**
   * Enable controls.
   */
  enable = () => {
    this.enabled = true;
  }

  /**
   * Disable controls.
   */
  disable = () => {
    this.enabled = false;
  }

  /**
   * Starts autorotating the scene clockwise.
   *
   * @param {Number} speed - speed to rotate at
   */
  startAutoRotate = (speed) => {
    this.autoRotate = true;
    this.autoRotateSpeed = speed;
  }

  /**
   * Stop autorotating the scene.
   */
  stopAutoRotate = () => {
    this.autoRotate = false;
  }

  /**
   * Deletes Tween instance and data.
   */
  endTween = () => {
    delete this.tweenData;
    delete this.tweenBase;
  }

  /**
   * Cancels Tween, if one is in progress.
   */
  cancelTween = () => {
    if (this.tweenBase) {
      this.tweenBase.stop();
      this.endTween();
    }
  }

  /**
   * Zooms to the level of the current Tween data.
   */
  updateTween = () => {
    this.zoom(this.tweenData.level);
  }

  /**
   * Invokes teardown methods for active tween.
   */
  completeTween = () => {
    if (this.tweenDone) {
      this.tweenDone(this.level);
    }
    this.endTween();
  }

  /**
   * Creates an animation to zoom to the specified level.
   *
   * @param {Number} level - percentage of zoom
   * @param {Function} onDone - animation completion callback
   */
  tweenZoom = (level, onDone) => {
    this.cancelTween();

    this.tweenDone = onDone;
    this.tweenData = {level: this.level};

    this.tweenBase = new TWEEN
      .Tween(this.tweenData)
      .easing(TWEEN.Easing.Quadratic.Out)
      .to({level}, Constants.WebGL.Tween.SLOW)
      .onUpdate(this.updateTween)
      .onComplete(this.completeTween)
      .start();
  }
}
