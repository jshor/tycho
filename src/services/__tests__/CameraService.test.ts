import {Vector3, Object3D, Scene} from 'three';
import TWEEN from 'tween.js';
import CameraService from '../CameraService';
import Gyroscope from '../../utils/Gyroscope';
import fixture from './__fixtures__/planets.json';

describe('Camera Service', () => {
    describe('getPivotTween()', () => {
        it('should return a new instance of Tween', () => {
            const tween = CameraService.getPivotTween();

            expect(tween).toBeDefined();
            expect(tween).toBeInstanceOf(TWEEN.Tween);
        });
    });

    describe('setPivotPosition()', () => {
        it('should reset the pivot position to the given vector', () => {
            const x = 1;
            const y = 2;
            const z = 3;
            const pivot = new Object3D();
            const spy = jest.spyOn(pivot.position, 'set');

            CameraService.setPivotPosition(pivot, {x, y, z});

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(x, y, z);
        });
    });

    describe('getWorldPosition()', () => {
        const scene = new Scene();
        const object = new Object3D();
        const position = new Vector3(5, 6, 1);

        beforeEach(() => {
            scene.add(object);
            object.position.copy(position);
        });

        it('should be an instance of Vector3', () => {
            const result = CameraService.getWorldPosition(object);

            expect(result).toBeInstanceOf(Vector3);
        });

        it('should return the world position of a given object', () => {
            const result = CameraService.getWorldPosition(object);

            expect(result).toEqual(position);
        });
    });

    describe('getMinDistance()', () => {
        it('should return the min distance required for a given planet', () => {
            expect(CameraService.getMinDistance(fixture, 'Earth')).toEqual(0.001005);
        });

        it('should return 0 if the target distance is not available', () => {
            expect(CameraService.getMinDistance(fixture, 'Bogus')).toEqual(0);
        });
    });

    describe('attachToWorld()', () => {
        const scene = new Object3D();
        const pivot = new Object3D();
        const position = new Vector3(1, 2, 3);

        beforeEach(() => {
            CameraService.attachToWorld(scene, pivot, position);
        });

        it('should add the given pivot to the scene', () => {
            expect(scene.children).toContainEqual(pivot);
        });

        it('should set the position of the pivot to the given vector', () => {
            expect(pivot.position).toEqual(position);
        });
    });

    describe('attachToGyroscope()', () => {
        const target = new Object3D();
        const pivot = new Object3D();
        const callback = jest.fn();

        beforeEach(() => {
            CameraService.attachToGyroscope(target, pivot, callback);
        });

        it('should add a gyroscope to the given target', () => {
            expect(target.children).toHaveLength(1);
            expect(target.children[0]).toBeInstanceOf(Gyroscope);
        });

        it('should set the position of the pivot to <0>', () => {
            expect(pivot.position).toEqual(new Vector3(0, 0, 0));
        });
    });
});
