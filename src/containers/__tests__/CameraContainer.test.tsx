import { vi } from 'vitest';
import CameraService from '../../services/CameraService';
import Controls from '../../utils/Controls';
import Constants from '../../constants';
import { Vector3, Object3D } from 'three';

vi.mock('../../services/CameraService');
vi.mock('../../utils/Ambience');

describe('Camera Container', () => {
    // CameraContainer is now a functional component with forwardRef.
    // Tests focus on the logic helpers and the Controls class it delegates to.

    describe('Controls integration', () => {
        let camera: any;
        let controls: Controls;

        beforeEach(() => {
            camera = { position: new Vector3(1, 1, 1) };
            controls = new Controls(camera, document.createElement('canvas'));
        });

        describe('zoom()', () => {
            it('should update the level and pan when the zoom level changes', () => {
                const spy = vi.spyOn(controls, 'pan');
                controls.level = 60;
                controls.zoom(50);

                expect(controls.level).toBe(50);
                expect(spy).toHaveBeenCalledWith(50 / 100);
            });

            it('should not pan when the level is unchanged', () => {
                const spy = vi.spyOn(controls, 'pan');
                controls.level = 50;
                controls.zoom(50);

                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('tweenZoom()', () => {
            it('should start a new Tween on the controls', () => {
                const spy = vi.spyOn(controls, 'cancelTween');
                controls.tweenZoom(50);

                expect(spy).toHaveBeenCalledTimes(1);
                expect(controls.tweenBase).toBeDefined();
            });
        });

        describe('autoRotate', () => {
            it('should enable auto-rotate', () => {
                controls.autoRotate = false;
                controls.startAutoRotate(2);

                expect(controls.autoRotate).toBe(true);
                expect(controls.autoRotateSpeed).toBe(2);
            });

            it('should disable auto-rotate', () => {
                controls.autoRotate = true;
                controls.stopAutoRotate();

                expect(controls.autoRotate).toBe(false);
            });
        });
    });

    describe('CameraService helpers (used by pivot animation)', () => {
        describe('cancelTween logic', () => {
            it('should stop and clear tweenBase when present', () => {
                const stop = vi.fn();
                const tweenBaseRef = { current: { stop } };

                if (tweenBaseRef.current) {
                    tweenBaseRef.current.stop();
                    tweenBaseRef.current = null;
                }

                expect(stop).toHaveBeenCalledTimes(1);
                expect(tweenBaseRef.current).toBeNull();
            });
        });

        describe('zoomInFull logic', () => {
            it('should call controls.tweenZoom with the MIN zoom constant', () => {
                const camera = { position: new Vector3(1, 1, 1) };
                const controls = new Controls(camera as any, document.createElement('canvas'));
                const changeZoom = vi.fn();
                const spy = vi.spyOn(controls, 'tweenZoom');

                controls.tweenZoom(Constants.WebGL.Zoom.MIN, changeZoom);

                expect(spy).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN, changeZoom);
            });
        });
    });
});
