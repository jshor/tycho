import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import PlayPause from './';

describe('Play/Pause Button Component', () => {
    let component;

    beforeEach(() => {
        component = shallow(<PlayPause onClick={jest.fn()} />);
    });

    it('should render the PlayPause button successfully', () => {
        expect(toJson(component)).toMatchSnapshot();
    });
});
