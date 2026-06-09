import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {PerspectiveCamera} from 'three';
import Sun from './Sun';
import LensFlare from '../../utils/LensFlare';

describe.only('The Sun', () => {
    const camera = new PerspectiveCamera();
    let component;
    let sun;

    beforeEach(() => {
        component = shallow((
            <Sun camera={camera} />
        ));
        sun = component.instance();
    });

    describe('componentDidMount()', () => {
        const children = [];

        beforeEach(() => {
            sun.props = {camera};
            sun.refs = {
                sun: {
                    add: (e) => children.push(e)
                }
            };
        });

        it('should add a new instance of LensFlare', () => {
            sun.componentDidMount();

            expect(children).toHaveLength(1);
            expect(children[0]).toBeInstanceOf(LensFlare);
        });

        it('should add a new element to the Sun ref via add()', () => {
            const spy = jest.spyOn(sun.refs.sun, 'add');

            sun.componentDidMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('render()', () => {
        it('should render the Sun', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
