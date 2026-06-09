import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Tour from './Tour';

describe('Tour Component', () => {
    it('should render the Tour component successfully', () => {
        const component = shallow(<Tour modifier="show" pageText={{}} />);

        expect(toJson(component)).toMatchSnapshot();
    });
});
