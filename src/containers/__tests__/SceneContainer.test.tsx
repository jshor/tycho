import React from 'react';
import {CubeTexture} from 'three';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import {SceneContainer} from '../SceneContainer';
import data from './__fixtures__/orbitals.json';

describe('Scene Container', () => {
    let component;
    let sceneContainer;

    beforeEach(() => {
        component = shallow(
            <SceneContainer
                orbitalData={data}
                action={{setPosition: jest.fn()}}
                onAnimate={jest.fn()}
                width={500}
                height={300}
                time={1}
            />
        );

        sceneContainer = component.instance();
    });

    describe('componentDidMount()', () => {
        beforeEach(() => {
            sceneContainer.renderSkybox = jest.fn();
        });

        it('should force update once', () => {
            const spy = jest.spyOn(sceneContainer, 'forceUpdate');

            sceneContainer.componentDidMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should render the skybox', () => {
            const spy = jest.spyOn(sceneContainer, 'renderSkybox');

            sceneContainer.componentDidMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('onAnimate()', () => {
        beforeEach(() => {
            sceneContainer.props = {onAnimate: jest.fn()};
            sceneContainer.refs = {camera};
        });

        it('should call props.onAnimate()', () => {
            const onAnimateSpy = jest.spyOn(sceneContainer.props, 'onAnimate');

            sceneContainer.onAnimate();

            expect(onAnimateSpy).toHaveBeenCalled();
            expect(onAnimateSpy).toHaveBeenCalledTimes(1);
        });

        it('should update the camera component', () => {
            const spy = jest.spyOn(sceneContainer.refs.camera, 'update');

            sceneContainer.onAnimate();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('changeZoom()', () => {
        it('should call controls.wheelZoom()', () => {
            sceneContainer.refs = {camera};
            sceneContainer.props = {action: {}};
            const spy = jest.spyOn(sceneContainer.refs.camera.controls, 'wheelZoom');

            sceneContainer.changeZoom();

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('setDomElement()', () => {
        it('should set `domElement` to the value of the param passed', () => {
            const elem = <canvas />;
            sceneContainer.setDomElement(elem);

            expect(sceneContainer).toHaveProperty('domElement');
            expect(sceneContainer.domElement).toEqual(elem);
        });
    });

    describe('renderSkybox()', () => {
        it('should set the `background` property of the scene to a cube texture', () => {
            sceneContainer.refs = {
                scene: {
                    background: null
                }
            };
            sceneContainer.renderSkybox();

            expect(sceneContainer.refs.scene).toHaveProperty('background');
            expect(sceneContainer.refs.scene.background).toBeInstanceOf(CubeTexture);
        });
    });

    describe('render()', () => {
        it('should render the scene container without the camera', () => {
            expect(toJson(component)).toMatchSnapshot();
        });

        it('should render the scene container with the camera', () => {
            sceneContainer.refs = {camera};
            sceneContainer.render();
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});

const camera = {
    controls: {
        wheelZoom: jest.fn()
    },
    update: jest.fn(),
    refs: {
        camera: {
            position: {
                clone: jest.fn()
            }
        }
    }
};
