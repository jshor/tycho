import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import TourLabel from './TourLabel';

describe('TourLabel Component', () => {
    describe('render()', () => {
        it('should render the app successfully', () => {
            const component = shallow(
                <TourLabel
                    modifier="hide"
                    text="Hello, world"
                />
            );
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
