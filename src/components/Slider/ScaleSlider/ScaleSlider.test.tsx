import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import ScaleSlider from './ScaleSlider';

describe('Scale Slider Component', () => {
    describe('render()', () => {
        describe('when the value is set', () => {
            it('should successfully render the slider', () => {
                const component = shallow(<ScaleSlider
                    value={40}
                    label="Test Slider"
                    onChange={jest.fn()}
                />);

                expect(toJson(component)).toMatchSnapshot();
            });
        });

        describe('when the value is undefined', () => {
            it('should successfully render the slider', () => {
                const component = shallow(<ScaleSlider
                    label="Test Slider"
                    onChange={jest.fn()}
                />);

                expect(toJson(component)).toMatchSnapshot();
            });
        });
    });
});
