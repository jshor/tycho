import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Orbital from './Orbital';

describe('Orbital Component', () => {
    let component;
    let updatePosition;

    beforeEach(() => {
        const position = {};
        const rotation = {};

        updatePosition = jest.fn();

        component = shallow(<Orbital
            updatePosition={updatePosition}
            eclipticGroupRotation={rotation}
            orbitalGroupRotation={rotation}
            pathVertices={[]}
            bodyPosition={position}
            bodyRotation={rotation}
            radius={1}
            id="testOrbital"
            text="Test Orbital"
            action={{}}
        />);
    });

    describe('render()', () => {
        it('should render the orbital successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
