import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import UIControls from './UIControls';

describe('UIControls Component', () => {
    describe('render()', () => {
        it('should render the UIControls successfully', () => {
            const component = shallow(<UIControls
                pageText={{}}
                openModal={jest.fn()}
            />);
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
