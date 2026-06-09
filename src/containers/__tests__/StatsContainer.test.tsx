import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {StatsContainer} from '../StatsContainer';
import OrbitalService from '../../services/OrbitalService';
import orbitalData from './__fixtures__/orbitals.json';

describe('Stats Container', () => {
    let component;
    let statsContainer;

    beforeEach(() => {
        component = shallow(
            <StatsContainer
                orbitalData={orbitalData}
                targetId="dummyPlanet"
            />
        );
        statsContainer = component.instance();
    });

    describe('componentWillReceiveProps()', () => {
        let spy;

        beforeEach(() => {
            OrbitalService.getTargetByName = () => orbitalData[0];
            spy = jest.spyOn(statsContainer, 'updateOrbitalStats');
        });

        it('should call updateTargetParams if the targetId has changed', () => {
            const targetId = 'Mars';
            const time = 1;
            const nextProps = {targetId, time};

            statsContainer.props = {targetId: 'Earth', time};
            statsContainer.componentWillReceiveProps(nextProps);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(targetId, time);
        });

        it('should call updateTargetParams if the time has changed', () => {
            const targetId = 'Mars';
            const time = 2;
            const nextProps = {targetId, time};

            statsContainer.props = {targetId, time: 1};
            statsContainer.componentWillReceiveProps(nextProps);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(targetId, time);
        });

        it('should not call updateTargetParams if neither the targetId nor the time has changed', () => {
            const targetId = 'Earth';
            const time = 1;
            const nextProps = {targetId, time};

            statsContainer.props = {targetId, time};
            statsContainer.componentWillReceiveProps(nextProps);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('updateOrbitalStats()', () => {
        const targetId = 'earth';
        const target = {targetId, name: 'Earth'};

        it('should update the component state with the velocity, magnitude, and trueAnomaly params', () => {
            const magnitude = '5.000';
            const velocity = '4.000';
            const trueAnomaly = '3.000';

            OrbitalService.getTargetByName = () => target;
            OrbitalService.getOrbitalStats = () => ({magnitude, velocity, trueAnomaly});
            statsContainer.updateOrbitalStats(targetId, 1);

            expect(component.state('magnitude')).toEqual(magnitude);
            expect(component.state('velocity')).toEqual(velocity);
            expect(component.state('trueAnomaly')).toEqual(trueAnomaly);
        });

        it('should update the component state with the name of the active target orbital', () => {
            OrbitalService.getTargetByName = () => target;
            OrbitalService.getOrbitalStats = () => {};
            statsContainer.updateOrbitalStats(targetId, 1);

            expect(typeof component.state('name')).toBe('string');
            expect(component.state('name')).toEqual(target.name);
        });

        it('should not update the state with magnitude, velocity, or trueAnomaly if the target is missing', () => {
            OrbitalService.getTargetByName = () => null;
            statsContainer.updateOrbitalStats(targetId, 1);

            expect(component.state('magnitude')).not.toBeDefined();
            expect(component.state('velocity')).not.toBeDefined();
            expect(component.state('trueAnomaly')).not.toBeDefined();
        });
    });

    describe('render()', () => {
        it('should render the modal successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
