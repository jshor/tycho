import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import DatePicker from './';

describe('DatePicker Component', () => {
    describe('render()', () => {
        it('should render the DatePicker component successfully', () => {
            const component = shallow(
                <DatePicker
                    onClick={jest.fn()}
                    uxTime="04/20/6969"
                />
            );
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
