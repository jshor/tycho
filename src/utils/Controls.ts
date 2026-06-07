import * as THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import TWEEN from 'tween.js';
import Constants from '../constants';

const OrbitControlsBase: any = OrbitControls(THREE);

export default class Controls extends OrbitControlsBase {

    camera: THREE.Camera;
    level: number;
    tweenData: { level: number };
    tweenBase: any;
    tweenDone: ((level: number) => void) | undefined;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        super(camera, domElement);

        this.camera = camera;
        this.enabled = true;
        this.enableZoom = false;
        this.enablePan = false;
        this.level = Constants.WebGL.Zoom.MAX;
        this.minDistance = Constants.WebGL.Camera.MIN_DISTANCE;
        this.maxDistance = Constants.WebGL.Camera.MAX_DISTANCE;
    }

    zoom = (level: number): void => {
        if (this.level !== level) {
            this.pan(level / 100);
            this.level = level;
        }
    }

    wheelZoom = (ev: WheelEvent, action: (zoom: number) => void): void => {
        const zoom = this.getZoomDelta(ev.deltaY);
        const current = Math.round(this.level * 100);

        if (current !== zoom) {
            action(zoom);
        }
    }

    getZoomDelta = (delta: number): number => {
        let zoom = this.level;

        zoom += (delta / this.getWheelDeltaDivisor(zoom));
        zoom = Math.max(zoom, 0);
        zoom = Math.min(zoom, 100);

        return zoom;
    }

    getWheelDeltaDivisor = (level: number): number => {
        let delta = Constants.UI.WHEEL_DELTA_DIVISOR;
        let match = false;

        Constants.WebGL.ScrollScale.forEach(({ distance, scale }) => {
            if (level > distance && !match) {
                delta *= scale;
                match = true;
            }
        });

        return delta;
    }

    pan = (percent: number): void => {
        const position = (this.camera as any).position;
        const newVector = this.getZoomVector(position, this.maxDistance * percent);
        const minVector = this.getZoomVector(position, this.minDistance);

        if (newVector.length() >= this.minDistance) {
            position.copy(newVector);
        } else {
            position.copy(minVector);
        }
    }

    getZoomVector = (vector: THREE.Vector3, scalar: number): THREE.Vector3 => {
        return vector
            .clone()
            .normalize()
            .multiplyScalar(scalar);
    }

    getDistance = (): number => {
        return this.maxDistance - this.minDistance;
    }

    enable = (): void => {
        this.enabled = true;
    }

    disable = (): void => {
        this.enabled = false;
    }

    startAutoRotate = (speed: number): void => {
        this.autoRotate = true;
        this.autoRotateSpeed = speed;
    }

    stopAutoRotate = (): void => {
        this.autoRotate = false;
    }

    endTween = (): void => {
        delete this.tweenData;
        delete this.tweenBase;
    }

    cancelTween = (): void => {
        if (this.tweenBase) {
            this.tweenBase.stop();
            this.endTween();
        }
    }

    updateTween = (): void => {
        this.zoom(this.tweenData.level);
    }

    completeTween = (): void => {
        if (this.tweenDone) {
            this.tweenDone(this.level);
        }
        this.endTween();
    }

    tweenZoom = (level: number, onDone: (level: number) => void): void => {
        this.cancelTween();

        this.tweenDone = onDone;
        this.tweenData = { level: this.level };

        this.tweenBase = new (TWEEN as any)
            .Tween(this.tweenData)
            .easing((TWEEN as any).Easing.Quadratic.Out)
            .to({ level }, Constants.WebGL.Tween.SLOW)
            .onUpdate(this.updateTween)
            .onComplete(this.completeTween)
            .start();
    }
}
