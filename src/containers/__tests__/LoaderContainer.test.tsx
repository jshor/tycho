import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {DefaultLoadingManager} from 'three';
import {LoaderContainer} from '../LoaderContainer';

describe('Loader Container', () => {
    let component;
    let loaderContainer;

    beforeEach(() => {
        component = shallow(<LoaderContainer
            action={{
                setPercentLoaded: jest.fn(),
                setTextureLoaded: jest.fn(),
                setPlaying: jest.fn(),
                setVolume: jest.fn()
            }}
        />);
        loaderContainer = component.instance();
    });

    describe('componentDidMount()', () => {
        it('should assign `onProgress` to the DefaultLoadingManager', () => {
            expect(DefaultLoadingManager.onProgress).toEqual(loaderContainer.onProgress);
        });
    });

    describe('onProgress()', () => {
        const url = 'myImage.jpg';
        const count = 5;
        const total = 8;

        it('should call the setPercentLoaded() action', () => {
            const spy = jest.spyOn(loaderContainer.props.action, 'setPercentLoaded');

            loaderContainer.onProgress(url, count, total);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(count, total);
        });

        it('should call the setTextureLoaded() action', () => {
            const spy = jest.spyOn(loaderContainer.props.action, 'setTextureLoaded');

            loaderContainer.onProgress(url, count, total);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(url);
        });
    });

    describe('enterScene()', () => {
        it('should call the setPlaying() action with true', () => {
            const spy = jest.spyOn(loaderContainer.props.action, 'setPlaying');

            loaderContainer.enterScene();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(true);
        });
    });

    describe('render()', () => {
        it('should render the loader container successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
