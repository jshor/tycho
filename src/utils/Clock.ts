import * as THREE from 'three';
import TWEEN from 'tween.js';
import moment from 'moment';
import Constants from '../constants';

export default class Clock {

    constructor() {
        this.clock = new THREE.Clock();
        this.offset = this.getOffset();
        this.start();
        this.scale = 1;
    }

    /**
     * Get time offset.
     *
     * @param {Number} time - UNIX timestamp
     * @returns {Number} unix timestamp
     */
    getOffset = (time) => {
        if (time) {
            return time;
        }
        return moment().unix();
    }

    /**
     * Current scaled timestamp.
     *
     * @returns {Number} UNIX timestamp
     */
    getTime = () => {
        let time = this.clock.getElapsedTime();
        time *= this.scale;
        time += this.offset;

        return Math.ceil(time);
    }

    /**
     * Clock update method. Intended to be called from within
     * an animation loop to prepare the next frame time.
     */
    update = () => {
        const elapsedTime = this.clock.getElapsedTime();

        if (elapsedTime !== this.elapsedTime) {
            this.elapsedTime = elapsedTime;
        }
        TWEEN.update();
    }

    /**
     * Sets the scale of the clock, as base 10.
     * Example: a scalar of 0 means real time (10^0=1)
     *
     * @param {Number} e - scalar exponent
     */
    speed = (e) => {
        const scale = Math.pow(10, e || 0);

        if (scale !== this.scale) {
            this.stopTween();
            this.offset = this.getTime();
            this.scale = scale;
            this.start();
        }
    }

    /**
     * Starts the clock.
     */
    start = () => {
        this.stopped = false;
        this.clock.start();
    }

    /**
     * Continues the clock from where it left off.
     */
    continue = () => {
        const { elapsedTime } = this.clock;

        this.stopped = false;
        this.clock.start();
        this.clock.elapsedTime = elapsedTime;
    }

    /**
     * Stops the clock.
     */
    stop = () => {
        this.stopped = true;
        this.clock.stop();
    }

    /**
     * Forces the active Tween to stop and updates the current offset to the destination one.
     */
    stopTween = () => {
        if (this.tween) {
            this.tween.stop();
            this.offset = this.destinationOffset;
            this.start();
            delete this.tween;
        }
    }

    /**
     * Updates the clock offset with current tween offset time.
     */
    updateTweenOffset = () => {
        this.offset = this.tweenData.offset;
    }

    /**
     * Tweens the offset time to the given time.
     *
     * @param {Number} time - UNIX timestamp
     * @returns {Tween} - tween instance
     */
    setOffset = (time) => {
        this.stop();
        this.stopTween();
        this.tweenData = {
            offset: this.offset
        };
        this.destinationOffset = time;

        this.tween = new TWEEN.Tween(this.tweenData)
            .easing(TWEEN.Easing.Quadratic.Out)
            .to({ offset: time }, Constants.WebGL.Tween.NORMAL)
            .onUpdate(this.updateTweenOffset)
            .onComplete(this.start)
            .start();
    }
}
