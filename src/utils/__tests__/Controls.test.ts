import TWEEN from 'tween.js';
import {Camera, Vector3} from 'three';
import Controls from '../Controls';

describe('Controls', () => {
    let camera;
    let controls;

    beforeEach(() => {
        camera = new Camera();
        controls = new Controls(camera);
    });

    describe('zoom()', () => {
        describe('when the zoom level has changed', () => {
            const newLevel = 50;
            let spy;

            beforeEach(() => {
                spy = jest.spyOn(controls, 'pan');
                controls.level = 60;

                controls.zoom(newLevel);
            });

            it('should update the `level` property to the new zoom and pan', () => {
                expect(typeof controls.level).toBe('number');
                expect(controls.level).toEqual(newLevel);
            });

            it('should call pan with `newLevel` converted to a decimal percentage', () => {
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(newLevel / 100);
            });
        });

        describe('when the zoom level has not changed', () => {
            it('should not change the `level` property', () => {
                const oldLevel = 50;
                controls.level = oldLevel;

                controls.zoom(oldLevel);

                expect(typeof controls.level).toBe('number');
                expect(controls.level).toEqual(oldLevel);
            });
        });
    });

    describe('getZoomDelta()', () => {
        it('should calculate the proper zoom delta', () => {
            controls.level = 50;
            const result = controls.getZoomDelta(-40);

            expect(typeof result).toBe('number');
            expect(result).toEqual(49.92);
        });
    });

    describe('getWheelDeltaDivisor()', () => {
        it('should calculate the proper wheel delta divisor', () => {
            controls.level = 50;
            const result = controls.getWheelDeltaDivisor(0.3);

            expect(typeof result).toBe('number');
            expect(result).toEqual(500);
        });
    });

    describe('pan()', () => {
        it('should set the camera position vector to the new zoom vector', () => {
            const zoomVector = new Vector3(1, 2, 3);

            controls.getZoomVector = () => zoomVector;
            controls.pan(50);

            expect(controls.camera.position).toBeInstanceOf(Vector3);
            expect(controls.camera.position).toEqual(zoomVector);
        });

        it('should set the camera position vector to the smallest possible zoom vector', () => {
            const zoomVector = new Vector3(0, 0, 0);

            controls.minDistance = 1;
            controls.getZoomVector = () => zoomVector;
            controls.pan(0, true);

            expect(controls.camera.position).toBeInstanceOf(Vector3);
            expect(controls.camera.position).toEqual(zoomVector);
        });
    });

    describe('getZoomVector()', () => {
        it('should scale the given vector by the given scalar', () => {
            const vector = new Vector3(1, 2, 3);
            const scalar = 10;

            controls.maxDistance = 4;

            const result = controls.getZoomVector(vector, scalar);
            const expected = vector.normalize().multiplyScalar(scalar);

            expect(result).toBeInstanceOf(Vector3);
            expect(result.x).toEqual(expected.x);
            expect(result.y).toEqual(expected.y);
            expect(result.z).toEqual(expected.z);
        });
    });

    describe('getDistance()', () => {
        it('should return maxDistance minus minDistance', () => {
            controls.maxDistance = 10;
            controls.minDistance = 3;

            const result = controls.getDistance();

            expect(typeof result).toEqual('number');
            expect(result).toEqual(7);
        });
    });

    describe('enable()', () => {
        it('should set the controls to be enabled', () => {
            controls.enable();

            expect(typeof controls.enabled).toBe('boolean');
            expect(controls.enabled).toEqual(true);
        });
    });

    describe('disable()', () => {
        it('should set the controls to be disabled', () => {
            controls.disable();

            expect(typeof controls.enabled).toBe('boolean');
            expect(controls.enabled).toEqual(false);
        });
    });

    describe('startAutoRotate()', () => {
        it('should start autorotating the scene at the given speed', () => {
            const speed = 2;

            controls.startAutoRotate(speed);

            expect(controls.autoRotate).toBe(true);
            expect(controls.autoRotateSpeed).toEqual(speed);
        });
    });

    describe('stopAutoRotate()', () => {
        it('should stop autorotating the scene', () => {
            controls.stopAutoRotate();

            expect(controls.autoRotate).toBe(false);
        });
    });

    describe('updateTween()', () => {
        it('should statically zoom to the current tween level', () => {
            const spy = jest.spyOn(controls, 'zoom');
            const level = 40;

            controls.tweenData = {level};
            controls.updateTween();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(level);
        });
    });

    describe('endTween()', () => {
        it('should dispose of the tweenBase and tweenData objects', () => {
            const spy = jest.spyOn(controls, 'endTween');

            controls.tweenBase = {};
            controls.tweenData = {};
            controls.completeTween();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('cancelTween()', () => {
        it('should stop the active tween', () => {
            const stop = jest.fn();
            controls.tweenBase = {stop};
            const spy = jest.spyOn(controls.tweenBase, 'stop');

            controls.cancelTween();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call endTween', () => {
            const stop = jest.fn();
            const spy = jest.spyOn(controls, 'endTween');

            controls.tweenBase = {stop};
            controls.cancelTween();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('completeTween()', () => {
        it('should invoke the tweenDone callback assignment, if exists', () => {
            controls.tweenDone = jest.fn();
            controls.tweenData = {};

            const spy = jest.spyOn(controls, 'tweenDone');

            controls.completeTween();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call endTween()', () => {
            const spy = jest.spyOn(controls, 'endTween');

            controls.tweenData = {};
            controls.completeTween();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('tweenZoom()', () => {
        it('should cancel any tween in progress', () => {
            const spy = jest.spyOn(controls, 'cancelTween');

            controls.tweenZoom(50);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should assign the tween data to be the current zoom level', () => {
            controls.level = 100;
            controls.tweenZoom(50);

            expect(controls).toHaveProperty('tweenData');
            expect(controls.tweenData).toHaveProperty('level');
            expect(controls.tweenData.level).toEqual(controls.level);
        });

        it('should assign a new tween to tweenBase', () => {
            const tween = new TWEEN.Tween();

            controls.tweenBase = tween;
            controls.tweenZoom(50);

            expect(controls).toHaveProperty('tweenBase');
            expect(controls.tweenBase).toBeInstanceOf(TWEEN.Tween);
        });
    });

    describe('wheelZoom()', () => {
        let action;
        let spy;

        beforeEach(() => {
            action = {changeZoom: jest.fn()};
            spy = jest.spyOn(action, 'changeZoom');
        });

        it('should call the given action callback with the calculated zoom, if changed', () => {
            const newZoom = 20;

            controls.getZoomDelta = () => newZoom;
            controls.wheelZoom({}, action.changeZoom);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(newZoom);
        });

        it('should not call the given callback if the zoom stays the same', () => {
            const newZoom = 20;

            controls.getZoomDelta = () => newZoom;
            controls.level = newZoom / 100;
            controls.wheelZoom({}, action.changeZoom);

            expect(spy).not.toHaveBeenCalled();
        });
    });
});
