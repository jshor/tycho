import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import TourLabelContainer from '../TourLabelContainer';

jest.useFakeTimers();

describe('Tour Label Container', () => {
    let component;
    let tourLabelContainer;

    beforeEach(() => {
        component = shallow(<TourLabelContainer
            start={1000}
            end={3000}
            text="Hello, world"
        />);
        tourLabelContainer = component.instance();
    });

    describe('componentWillMount()', () => {
        it('should initialize the modifier in state', () => {
            expect(component.state()).toHaveProperty('modifier');
            expect(typeof component.state('modifier')).toBe('string');
        });

        it('should set the start and stop modifier change classes', () => {
            const spy = jest.spyOn(tourLabelContainer, 'setClassAsync');
            const start = 1000;
            const end = 3000;

            tourLabelContainer.props = {start, end};
            tourLabelContainer.componentWillMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith('show', start);
            expect(spy).toHaveBeenCalledWith('hide', end);
        });
    });

    describe('componentWillUnmount()', () => {
        it('should set `isCancelled` to true', () => {
            tourLabelContainer.componentWillUnmount();

            expect(tourLabelContainer).toHaveProperty('isCancelled');
            expect(tourLabelContainer.isCancelled).toBe(true);
        });
    });

    describe('setClassAsync()', () => {
        describe('when the component is mounted', () => {
            it('should add the given BEM modifier to the modifier after the given duration', () => {
                const modifier = 'hide';

                component.setState({modifier: 'show'});
                tourLabelContainer.isCancelled = false;
                tourLabelContainer.setClassAsync(modifier, 1000);

                jest.runAllTimers();

                expect(component.state('modifier')).toEqual(modifier);
            });
        });

        describe('when the component is not mounted', () => {
            it('should not change the className modifier', () => {
                const modifier = 'hide';

                component.setState({modifier: 'show'});
                tourLabelContainer.isCancelled = true;
                tourLabelContainer.setClassAsync(modifier, 1000);

                jest.runAllTimers();

                expect(component.state('modifier')).not.toEqual(modifier);
            });
        });
    });

    describe('render()', () => {
        it('should render the app successfully', () => {
            component.setState({time: 1});
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
