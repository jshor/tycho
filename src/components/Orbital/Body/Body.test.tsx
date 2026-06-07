import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {Euler} from 'three';
import Body from './';
import Rings from '../Rings';

describe('Body Component', () => {
    let component;
    const radius = 100;
    const rotation = new Euler(1, 1, 1);

    beforeEach(() => {
        component = shallow(<Body
            radius={radius}
            rotation={rotation}
        />);
    });

    it('should render the rings if the rings prop is defined', () => {
        component = shallow(<Body
            radius={radius}
            rotation={rotation}
            rings={{
                outerRadius: 1234,
                barycenterTilt: 20,
                maps: []
            }}
        />);

        expect(component.find(Rings).exists()).toBe(true);
    });

    it('should render the body successfully', () => {
        expect(toJson(component)).toMatchSnapshot();
    });
});
