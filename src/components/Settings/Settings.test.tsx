import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import Settings from './Settings';

describe('Settings Component', () => {
    describe('render()', () => {
        it('should render the settings component', () => {
            const component = shallow(<Settings pageText={{}} />);

            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
