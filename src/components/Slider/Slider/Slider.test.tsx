import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Slider from './Slider';

describe('Slider Component', () => {
    let component;
    let slider;

    beforeEach(() => {
        component = shallow(<Slider
            onChange={jest.fn()}
            orientation="horizontal"
            value={40}
        />);
        slider = component.instance();
    });

    describe('componentDidMount()', () => {
        it('should assign state.value', () => {
            slider.componentDidMount();

            expect(slider.state).toHaveProperty('value');
            expect(typeof slider.state.value).toBe('number');
        });
    });

    describe('getInitialValue()', () => {
        it('should return 0, if the `value` prop is undefined', () => {
            slider.props = {value: undefined};
            const result = slider.getInitialValue();

            expect(typeof result).toBe('number');
            expect(result).toEqual(0);
        });

        it('should return the `value` prop value, if defined', () => {
            slider.props = {value: 10};
            const result = slider.getInitialValue();

            expect(typeof result).toBe('number');
            expect(result).toEqual(10);
        });
    });

    describe('getClassName()', () => {
        it('should append the child component class name, if defined', () => {
            const subName = 'handle';
            const result = slider.getClassName(subName);

            expect(typeof result).toBe('string');
            expect(result).toEqual(`slider__${subName} slider__${subName}--horizontal`);
        });

        it('should only return the base class name if no child defined', () => {
            const result = slider.getClassName();

            expect(typeof result).toBe('string');
            expect(result).toEqual(`slider slider--horizontal`);
        });
    });

    describe('render()', () => {
        it('should successfully render the slider', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
