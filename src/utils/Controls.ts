import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import TWEEN from 'tween.js';
import Constants from '../constants';

export default class Controls extends OrbitControls(THREE) {

    constructor(camera, domElement) {
        super(camera, domElement);

        this.camera = camera;
        this.enabled = true;
        this.enableZoom = false;
        this.enablePan = false;
        this.level = Constants.WebGL.Zoom.MAX;
        this.minDistance = Constants.WebGL.Camera.MIN_DISTANCE;
        this.maxDistance = Constants.WebGL.Camera.MAX_DISTANCE;
    }

    /**
     * Change zoom. Overrides the existing zoom tween in progress.
     *
     * @param {level} level - percentage of desired zoom level [0,100]
     */
    zoom = (level) => {
        if (this.level !== level) {
            this.pan(level / 100);
            this.level = level;
        }
    }

    /**
     * Gets the zoom delta from controls and invokes the given action if zoom has changed.
     *
     * @param {Event} ev - DOM wheel event
     * @param {Function} action - callback action
     */
    wheelZoom = (ev, action) => {
        const zoom = this.getZoomDelta(ev.deltaY);
        const current = Math.round(this.level * 100);

        if (current !== zoom) {
            action(zoom);
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

        zoom += (delta / this.getWheelDeltaDivisor(zoom));
        zoom = Math.max(zoom, 0);
        zoom = Math.min(zoom, 100);

        return zoom;
    }

    /**
     * Calculates a wheel delta that inflates based on how far away
     * the user is from the target, because outer space is really big.
     *
     * @param {Number} level - current zoom level
     * @returns {Number} scrollwheel delta
     */
    getWheelDeltaDivisor = (level) => {
        let delta = Constants.UI.WHEEL_DELTA_DIVISOR;
        let match = false;

        Constants.WebGL.ScrollScale
            .forEach(({ distance, scale }) => {
                if (level > distance && !match) {
                    delta *= scale;
                    match = true;
                }
            });

        return delta;
    }

    /**
     * Sets the current camera position to the scaled zoom vector.
     *
     * @param {Number} percent - percentage of zoom [0,1]
     */
    pan = (percent, log) => {
        const position = this.camera.position;
        const newVector = this.getZoomVector(position, this.maxDistance * percent);
        const minVector = this.getZoomVector(position, this.minDistance);

        if (newVector.length() >= this.minDistance) {
            position.copy(newVector);
        } else {
            position.copy(minVector);
        }
    }

    /**
     * Returns the current vector scaled to the desired magnitude.
     *
     * @param {Vector3} vector - current position vector
     * @param {Number} scalar - magnitude of vector
     * @returns {Vector3}
     */
    getZoomVector = (vector, scalar) => {
        return vector
            .clone()
            .normalize()
            .multiplyScalar(scalar);
    }

    /**
     * Returns the distance between <0> and current camera position.
     *
     * @returns {Number} distance
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
        this.tweenData = { level: this.level };

        this.tweenBase = new TWEEN
            .Tween(this.tweenData)
            .easing(TWEEN.Easing.Quadratic.Out)
            .to({ level }, Constants.WebGL.Tween.SLOW)
            .onUpdate(this.updateTween)
            .onComplete(this.completeTween)
            .start();
    }
}
