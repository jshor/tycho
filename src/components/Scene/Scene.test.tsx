import React from 'react';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import Scene from '../Scene';
import data from './__fixtures__/orbitals.json';

describe('Scene Component', () => {
    let component;
    let scene;

    beforeEach(() => {
        component = shallow(<Scene
            orbitalData={data}
            updatePosition={() => {}}
            time={1}
        />);

        scene = component.instance();
    });

    describe('getOrbitalElements()', () => {
        let orbitalContainers;

        beforeEach(() => {
            orbitalContainers = scene.getOrbitalElements(data);
        });

        it('should be an array', () => {
            expect(Array.isArray(orbitalContainers)).toBe(true)
        });

        it('should match the snapshot of OrbitalElements', () => {
            const orbitalJson = toJson(shallow(
                <group>orbitalContainers</group>
            ));

            expect(orbitalJson).toMatchSnapshot();
        });
    });

    describe('render()', () => {
        it('should render the scene', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
