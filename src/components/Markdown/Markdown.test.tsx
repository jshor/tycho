import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Markdown from './Markdown';

describe('Markdown Component', () => {
    let component;

    beforeEach(() => {
        component = shallow(<Markdown text="Hello, world!" />);
    });

    it('should render the markdown container successfully', () => {
        expect(toJson(component)).toMatchSnapshot();
    });
});