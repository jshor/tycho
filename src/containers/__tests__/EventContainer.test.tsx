import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {EventContainer} from '../EventContainer';

describe('Event Container', () => {
    let eventContainer;
    let component;

    beforeEach(() => {
        component = shallow(<EventContainer />);
        eventContainer = component.instance();
    });

    describe('Time-broadcasting Events', () => {
        const now = Date.now();

        beforeEach(() => {
            Date.now = () => now;
            eventContainer.props = {
                action: {
                    setTouched: jest.fn(),
                    setReleased: jest.fn()
                }
            }
        });

        describe('onTouched()', () => {
            it('should call the global setTouched() action with current timestamp', () => {
                const spy = jest.spyOn(eventContainer.props.action, 'setTouched');

                eventContainer.onTouched();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(now);
            });
        });

        describe('onReleased()', () => {
            it('should call the global setReleased() action with current timestamp', () => {
                const spy = jest.spyOn(eventContainer.props.action, 'setReleased');

                eventContainer.onReleased();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(now);
            });
        });
    });

    describe('render()', () => {
        it('should render the events container succesfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
