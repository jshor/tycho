import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import Orbital from './Orbital';

describe('Orbital Component', () => {
    let component: any;
    let updatePosition: any;

    beforeEach(() => {
        const position = {};
        const rotation = {};

        updatePosition = jest.fn();

        component = shallow(<Orbital
            {...{
                updatePosition,
                eclipticGroupRotation: rotation,
                orbitalGroupRotation: rotation,
                pathVertices: [],
                bodyPosition: position,
                bodyRotation: rotation,
                radius: 1,
                id: 'testOrbital',
                text: 'Test Orbital',
                action: {}
            } as any}
        />);
    });

    describe('render()', () => {
        it('should render the orbital successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
