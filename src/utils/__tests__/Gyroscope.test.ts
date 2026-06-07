import Gyroscope from '../Gyroscope';
import * as THREE from 'three';

describe('Gyroscope', () => {
    let gyroscope;

    beforeEach(() => {
        gyroscope = new Gyroscope();
    });

    describe('updateMatrixWorld()', () => {
        it('should call maybeAutoUpdateMatrix()', () => {
            const spy = jest.spyOn(gyroscope, 'assignMatrixWorld');

            gyroscope.updateMatrixWorld();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        const updateMatrixWorldTests = (matrixWorldNeedsUpdate, force) => {
            beforeEach(() => {
                gyroscope.matrixWorldNeedsUpdate = matrixWorldNeedsUpdate;
            });

            it('should call assignMatrixWorld()', () => {
                const spy = jest.spyOn(gyroscope, 'assignMatrixWorld');

                gyroscope.updateMatrixWorld(force);

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
            });

            it('should assign the matrixWorldNeedsUpdate to false', () => {
                gyroscope.updateMatrixWorld(force);

                expect(gyroscope.matrixWorldNeedsUpdate).toEqual(false);
            });

            it('should call updateChildrenMatrixWorlds with force = true', () => {
                const spy = jest.spyOn(gyroscope, 'updateChildrenMatrixWorlds');

                gyroscope.updateMatrixWorld(force);

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(true);
            });
        }

        describe('when matrixWorldNeedsUpdate flag is true', () => {
            updateMatrixWorldTests(true, false);
        });

        describe('when force flag is true', () => {
            updateMatrixWorldTests(false, true);
        });

        describe('when both the force and the matrixWorldNeedsUpdate flags are false', () => {
            it('should not call assignMatrixWorld()', () => {
                const spy = jest.spyOn(gyroscope, 'assignMatrixWorld');

                gyroscope.maybeAutoUpdateMatrix = jest.fn();
                gyroscope.matrixWorldNeedsUpdate = false;
                gyroscope.updateMatrixWorld(false);

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('maybeAutoUpdateMatrix()', () => {
        let spy;

        beforeEach(() => {
            spy = jest.spyOn(gyroscope, 'updateMatrix');
        });

        it('should call updateMatrix() if the matrixAutoUpdate flag is true', () => {
            gyroscope.matrixAutoUpdate = true;
            gyroscope.maybeAutoUpdateMatrix();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call updateMatrix() if the matrixAutoUpdate flag is false', () => {
            gyroscope.matrixAutoUpdate = false;
            gyroscope.maybeAutoUpdateMatrix();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('updateChildrenMatrixWorlds()', () => {
        it('should call updateMatrixWorld() on its children', () => {
            const child = new THREE.Object3D();
            const spy = jest.spyOn(child, 'updateMatrixWorld');

            gyroscope.add(child);
            gyroscope.updateChildrenMatrixWorlds();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('assignMatrixWorld()', () => {
        it('should copy an instance of the parent\'s Object3D if gyroscope is a child of it', () => {
            const parent = new THREE.Object3D();

            parent.add(gyroscope);
            gyroscope.assignMatrixWorld();

            expect(gyroscope.matrixWorld).toBeInstanceOf(THREE.Matrix4);
        });

        it('should clone the matrixWorld of its current matrix if it is not a child of an Object3D', () => {
            const currentMatrix = gyroscope.matrix;

            gyroscope.assignMatrixWorld();

            expect(gyroscope.matrixWorld).toEqual(currentMatrix);
        });
    });
});
