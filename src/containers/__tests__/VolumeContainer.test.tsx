import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {VolumeContainer} from '../VolumeContainer';
import Cookie from 'js-cookie';

jest.mock('js-cookie');

describe('Volume Container', () => {
    let component;
    let container;

    beforeEach(() => {
        component = shallow(<VolumeContainer
            action={{
                setVolume: jest.fn()
            }}
        />);
        container = component.instance();
    });

    describe('componentWillReceiveProps()', () => {
        describe('when the cookie-defined volume is 0', () => {
            beforeEach(() => {
                container.getVolume = () => 0;
            });

            it('should not change the volume if the new value is 0', () => {
                const spy = jest.spyOn(container.props.action, 'setVolume');

                container.componentWillReceiveProps({volume: 0});

                expect(spy).not.toHaveBeenCalled();
            });

            it('should change the volume if the new value is not 0', () => {
                const spy = jest.spyOn(container.props.action, 'setVolume');
                const volume = 1;

                container.componentWillReceiveProps({volume});

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(0);
            });
        });

        describe('when the cookie-defined volume is 1', () => {
            it('should not change the volume', () => {
                const spy = jest.spyOn(container.props.action, 'setVolume');

                container.getVolume = () => 1;
                container.componentWillReceiveProps({volume: 1});

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('setVolume()', () => {
        it('should set the volume cookie to the given level', () => {
            const spy = jest.spyOn(Cookie, 'set');
            const level = 1;

            container.setVolume(level);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith('volume', level, {expires: 365});
        });
    });

    describe('getVolume()', () => {
        it('should return 1 if the volume cookie value is \'1\'', () => {
            jest.spyOn(Cookie, 'get').mockReturnValue('1');

            const volume = container.getVolume();

            expect(typeof volume).toBe('number');
            expect(volume).toEqual(1);
        });
    });

    describe('triggerVolume()', () => {
        describe('when the volume is set to 0', () => {
            beforeEach(() => {
                container.getVolume = () => 0;
            });

            it('should call setVolume with 1', () => {
                const spy = jest.spyOn(container, 'setVolume');

                container.triggerVolume();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(1);
            });

            it('should call action.setVolume with 1', () => {
                const spy = jest.spyOn(container.props.action, 'setVolume');

                container.triggerVolume();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(1);
            });
        });

        describe('when the volume is set to 1', () => {
            beforeEach(() => {
                container.getVolume = () => 1;
            });

            it('should call setVolume with 0', () => {
                const spy = jest.spyOn(container, 'setVolume');

                container.triggerVolume();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(0);
            });

            it('should call action.setVolume with 0', () => {
                const spy = jest.spyOn(container.props.action, 'setVolume');

                container.triggerVolume();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(0);
            });
        });
    });

    describe('render()', () => {
        it('should successfully render the volume container', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
