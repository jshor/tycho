import React from 'react';
import TWEEN from 'tween.js';
import {Vector3, Camera, Object3D} from 'three';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import CameraContainer from '../CameraContainer';
import Controls from '../../utils/Controls';
import Ambience from '../../utils/Ambience';
import Constants from '../../constants';
import data from './__fixtures__/orbitals.json';
import CameraService from '../../services/CameraService';

jest.mock('../../services/CameraService');
jest.mock('../../utils/Ambience');

/* mock data */
const target = new Object3D();
const pivot = new Object3D();
const action = {
    setUIControls: jest.fn(),
    changeSpeed: jest.fn(),
    setPlaying: jest.fn()
};
const scene = {
    getObjectByName: () => target,
    add: jest.fn()
};

describe('Camera Container', () => {
    let component;
    let cameraContainer;

    beforeEach(() => {
        component = shallow(
            <CameraContainer
                action={action}
                targetId="testPlanet"
                orbitalData={data}
                scene={scene}
                ratio={1.5}
            />
        );
        cameraContainer = component.instance();
    });

    describe('componentDidMount()', () => {
        it('should assign a new instance of Ambience', () => {
            const camera = new Camera();

            cameraContainer.refs = {camera};
            cameraContainer.componentDidMount();

            expect(cameraContainer).toHaveProperty('ambience');
            expect(cameraContainer.ambience).toBeInstanceOf(Ambience);
        });
    });

    describe('componentWillUnmount()', () => {
        beforeEach(() => {
            const camera = new Camera();
            cameraContainer.controls = new Controls(camera);
        });

        it('should dispose of the controls', () => {
            const spy = jest.spyOn(cameraContainer.controls, 'dispose');

            cameraContainer.componentWillUnmount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should no longer have controls assigned to the class instance', () => {
            cameraContainer.componentWillUnmount();
            expect(cameraContainer).not.toHaveProperty('controls');
        });
    });

    describe('Prop update methods', () => {
        beforeEach(() => {
            cameraContainer.controls = new Controls(new Camera());
        });

        describe('componentWillReceiveProps()', () => {
            it('should start tweening to `targetId` if the prop has changed', () => {
                const targetId = 'Mars';
                const nextProps = {targetId: 'Earth'};
                const spy = jest.spyOn(cameraContainer, 'movePivot');

                cameraContainer.startTween = jest.fn();
                cameraContainer.props = {targetId, target, action, scene};
                cameraContainer.refs = {pivot};
                cameraContainer.componentWillReceiveProps(nextProps);

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(nextProps.targetId, true);
            });

            it('should not tween if the `targetId` if the prop has not changed', () => {
                const targetId = 'Mars';
                const nextProps = {targetId};
                const spy = jest.spyOn(cameraContainer, 'movePivot');

                cameraContainer.props = {targetId, action, scene};
                cameraContainer.componentWillReceiveProps(nextProps);

                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('maybeSetVolume()', () => {
            beforeEach(() => {
                cameraContainer.ambience = {
                    setVolume: jest.fn()
                };
            });

            it('should not call ambience.setVolume if the volume is unchanged', () => {
                const spy = jest.spyOn(cameraContainer.ambience, 'setVolume');
                const volume = 1;

                cameraContainer.props = {volume};
                cameraContainer.maybeSetVolume({volume});

                expect(spy).not.toHaveBeenCalled();
            });

            it('should call ambience.setVolume if the volume has changed', () => {
                const spy = jest.spyOn(cameraContainer.ambience, 'setVolume');
                const volume = 1;

                cameraContainer.props = {};
                cameraContainer.maybeSetVolume({volume});

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(volume);
            });
        });

        describe('maybeCreateControls()', () => {
            beforeEach(() => {
                delete cameraContainer.controls;
            });

            it('should create a new instance of Controls if the domElement has changed', () => {
                const domElement = <canvas />;

                cameraContainer.props = {domElement};
                cameraContainer.maybeCreateControls({domElement});

                expect(cameraContainer.controls).not.toBeDefined();
            });

            it('should not create a new instance of Controls if domElement is unchanged', () => {
                const camera = new Camera();
                const domElement = {
                    addEventListener: jest.fn()
                };

                cameraContainer.refs = {camera};
                cameraContainer.props = {};
                cameraContainer.maybeCreateControls({domElement});

                expect(cameraContainer.controls).toBeDefined();
                expect(cameraContainer.controls).toBeInstanceOf(Controls);
            });
        });

        describe('maybePreventCameraCollision()', () => {
            it('should update the minDistance if the targetId has changed', () => {
                const nextProps = {targetId: 'Mars'};
                const minDistance = 3;

                CameraService.getMinDistance = () => minDistance;
                cameraContainer.props = {targetId: 'Earth'};
                cameraContainer.controls.minDistance = 5;
                cameraContainer.maybePreventCameraCollision(nextProps);

                expect(cameraContainer.controls.minDistance).toEqual(minDistance);
            });

            it('should update the minDistance if the scale has changed', () => {
                const targetId = 'Earth';
                const nextProps = {targetId, scale: 5};
                const minDistance = 3;

                CameraService.getMinDistance = () => minDistance;
                cameraContainer.props = {targetId};
                cameraContainer.controls.minDistance = 5;
                cameraContainer.maybePreventCameraCollision(nextProps);

                expect(cameraContainer.controls.minDistance).toEqual(minDistance);
            });
        });

        describe('maybeUpdateAutoOrbit()', () => {
            it('should set controls.autoRotate to the value of `isAutoOrbitEnabled` if it has changed', () => {
                const isAutoOrbitEnabled = false;
                const nextProps = {isAutoOrbitEnabled};

                cameraContainer.props = {isAutoOrbitEnabled: !isAutoOrbitEnabled};
                cameraContainer.componentWillReceiveProps(nextProps);

                expect(cameraContainer.controls.autoRotate).toEqual(isAutoOrbitEnabled);
            });

            it('should change the value of controls.autoRotate if `isAutoOrbitEnabled` has not changed', () => {
                const isAutoOrbitEnabled = false;
                const nextProps = {isAutoOrbitEnabled};

                cameraContainer.props = {isAutoOrbitEnabled};
                cameraContainer.componentWillReceiveProps(nextProps);

                expect(cameraContainer.controls.autoRotate).toEqual(isAutoOrbitEnabled);
            });
        });

        describe('maybeUpdateControlsZoom()', () => {
            it('should call controls.zoom() if the `zoom` prop has changed', () => {
                const zoom = 10;
                const nextProps = {zoom: 20};
                const spy = jest.spyOn(cameraContainer.controls, 'zoom');

                cameraContainer.props = {zoom};
                cameraContainer.componentWillReceiveProps(nextProps);

                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(nextProps.zoom);
            });

            it('should not call controls.zoom() if the `zoom` prop has not changed', () => {
                const zoom = 10;
                const nextProps = {zoom};
                const spy = jest.spyOn(cameraContainer.controls, 'zoom');

                cameraContainer.props = {zoom};
                cameraContainer.componentWillReceiveProps(nextProps);

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('cancelTween()', () => {
        describe('when a tween is in progress', () => {
            beforeEach(() => {
                cameraContainer.tweenBase = {stop: jest.fn()};
            });

            it('should call endTween, if the tweenBase is defined', () => {
                const spy = jest.spyOn(cameraContainer.tweenBase, 'stop');

                cameraContainer.cancelTween();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
            });

            it('should dispose of tweenBase', () => {
                cameraContainer.cancelTween();
                expect(cameraContainer).not.toHaveProperty('tweenBase');
            });
        });

        describe('when no tween exists', () => {
            it('should not have tweenBase present', () => {
                cameraContainer.cancelTween();
                expect(cameraContainer).not.toHaveProperty('tweenBase');
            });
        });
    });

    describe('movePivot()', () => {
        describe('when the target exists and is set to animate', () => {
            const targetId = 'Earth';

            beforeEach(() => {
                cameraContainer.props = {scene};
                cameraContainer.refs = {pivot};
                cameraContainer.setInteractivity = jest.fn();
                cameraContainer.startTween = jest.fn();
            });

            it('should freeze UI interactivity', () => {
                const spy = jest.spyOn(cameraContainer, 'setInteractivity');

                cameraContainer.movePivot(targetId, true);

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(false);
            });

            it('should initialize the tween', () => {
                const spy = jest.spyOn(cameraContainer, 'startTween');

                cameraContainer.movePivot(targetId, true);

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(target, pivot, scene);
            });
        });

        describe('when the target does not exist', () => {
            it('should not freeze UI interactivity', () => {
                const targetId = 'Bogus';
                const spy = jest.spyOn(cameraContainer, 'setInteractivity');

                cameraContainer.props.scene.getObjectByName = jest.fn();
                cameraContainer.movePivot(targetId, true);

                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('when the animate flag is false', () => {
            it('should not freeze UI interactivity', () => {
                const targetId = 'Bogus';
                const spy = jest.spyOn(cameraContainer, 'setInteractivity');

                cameraContainer.props.scene.getObjectByName = jest.fn();
                cameraContainer.movePivot(targetId, false);

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('startTween()', () => {
        beforeEach(() => {
            cameraContainer.props = {scene, action};
            cameraContainer.refs = {pivot};
            cameraContainer.cancelTween = jest.fn();
            cameraContainer.zoomInFull = jest.fn();
            cameraContainer.controls = new Controls(new Camera());

            CameraService.getPivotTween = () => new TWEEN.Tween();
            CameraService.getWorldPosition = () => new Vector3();
        });

        describe('when the target exists in the scene', () => {
            beforeEach(() => {
                cameraContainer.props.scene.getObjectByName = () => target;
            });

            it('should tween the pivot to the discovered target', () => {
                const spy = jest.spyOn(CameraService, 'getPivotTween');
                const vect = new Vector3();

                cameraContainer.startTween(target, pivot, scene);

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(vect, vect, target, pivot, cameraContainer.endTween);
            });
        });
    });

    describe('endTween()', () => {
        it('should call setInteractivity with true', () => {
            const spy = jest.spyOn(cameraContainer, 'setInteractivity');

            cameraContainer.controls = {};
            cameraContainer.endTween();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(true);
        });
    });

    describe('zoomInFull()', () => {
        it('should call controls.tweenZoom()', () => {
            const changeZoom = jest.fn();
            const tweenZoom = jest.fn();

            cameraContainer.controls = {tweenZoom};
            cameraContainer.props = {action: {changeZoom}};

            const spy = jest.spyOn(cameraContainer.controls, 'tweenZoom');

            cameraContainer.zoomInFull();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(Constants.WebGL.Zoom.MIN, changeZoom);
        });
    });

    describe('update()', () => {
        it('should update the controls if controls exist', () => {
            cameraContainer.controls = {update: jest.fn()};
            const spy = jest.spyOn(cameraContainer.controls, 'update');

            cameraContainer.update();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should do nothing if no controls exist', () => {
            cameraContainer.controls = null;
            cameraContainer.update();

            expect(cameraContainer.controls).toBeNull();
        });
    });

    describe('render()', () => {
        it('should render the scene container successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
