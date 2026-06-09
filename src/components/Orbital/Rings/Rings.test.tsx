import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Rings from './';

describe('Rings Component', () => {
    let component;

    beforeEach(() => {
        component = shallow(
            <Rings
                outerRadius={1200}
                barycenterTilt={20}
                maps={[]}
            />
        );
    });

    it('should render the rings successfully', () => {
        expect(toJson(component)).toMatchSnapshot();
    });
});
