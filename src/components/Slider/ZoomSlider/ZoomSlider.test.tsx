import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import ZoomSlider from './ZoomSlider';

describe('Zoom Slider Component', () => {
    let component;

    describe('render()', () => {
        describe('when the slider value is defined', () => {
            it('should successfully render the slider', () => {
                component = shallow(<ZoomSlider
                    onChange={jest.fn()}
                />);
                expect(toJson(component)).toMatchSnapshot();
            });
        });

        describe('when the slider value is undefined', () => {
            it('should successfully render the slider', () => {
                component = shallow(<ZoomSlider
                    value={40}
                    onChange={jest.fn()}
                />);
                expect(toJson(component)).toMatchSnapshot();
            });
        });
    });
});
