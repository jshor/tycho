import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {UIControlsContainer} from '../UIControlsContainer';

describe('UIControls Container', () => {
    let component;
    let container;

    beforeEach(() => {
        component = shallow(<UIControlsContainer
            action={{
                changeSpeed: jest.fn()
            }}
        />);
        container = component.instance();
    });

    describe('toggleSettings()', () => {
        beforeEach(() => {
            container.props = {
                action: {
                    toggleSettings: jest.fn()
                },
                settingsActive: false
            };
        });

        it('should open the settings pane', () => {
            const spy = jest.spyOn(container.props.action, 'toggleSettings');

            container.toggleSettings();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(!container.props.settingsActive);
        });
    });

    describe('openModal()', () => {
        beforeEach(() => {
            container.props = {
                action: {
                    toggleModal: jest.fn(),
                    setUIControls: jest.fn()
                }
            };
        });

        it('should open the modal', () => {
            const type = 'TEST_MODAL';
            const spy = jest.spyOn(container.props.action, 'toggleModal');

            container.openModal(type);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(type);
        });

        it('should hide the UI Controls', () => {
            const spy = jest.spyOn(container.props.action, 'setUIControls');

            container.openModal();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(false);
        });
    });

    describe('render()', () => {
        it('should successfully render the ui controls container', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
