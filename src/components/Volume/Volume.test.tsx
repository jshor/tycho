import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Volume from './Volume';

describe('Volume Component', () => {
    describe('render()', () => {
        it('should render the Volume successfully', () => {
            const component = shallow(<Volume />);
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
