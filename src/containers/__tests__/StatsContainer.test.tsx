import React from 'react';
import { render } from '@testing-library/react';
import { StatsContainer } from '../StatsContainer';
import OrbitalService from '../../services/OrbitalService';
import data from './__fixtures__/orbitals.json';

describe('Stats Container', () => {
    let ref: React.RefObject<StatsContainer>;

    beforeEach(() => {
        ref = React.createRef<StatsContainer>();
        render(
            <StatsContainer
                orbitalData={data as any}
                pageText={{} as any}
                time={1}
                ref={ref as any}
            />
        );
    });

    describe('componentDidUpdate()', () => {
        it('should call updateOrbitalStats when targetId changes', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'updateOrbitalStats');

            (container as any).props = { targetId: 'Mars', time: 1 };
            container.componentDidUpdate({ targetId: 'Earth', time: 1 } as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call updateOrbitalStats when time changes', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'updateOrbitalStats');

            (container as any).props = { targetId: 'Earth', time: 2 };
            container.componentDidUpdate({ targetId: 'Earth', time: 1 } as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should not call updateOrbitalStats when nothing changed', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'updateOrbitalStats');

            (container as any).props = { targetId: 'Earth', time: 1 };
            container.componentDidUpdate({ targetId: 'Earth', time: 1 } as any);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('updateOrbitalStats()', () => {
        it('should set name, description, and orbital stats in state', () => {
            const container = ref.current!;
            const target = (data as any)[1];

            OrbitalService.getOrbitalStats = () => ({ magnitude: '1AU', velocity: '10km/s', trueAnomaly: '45°' });
            OrbitalService.getTargetByName = () => target;

            (container as any).props = { orbitalData: data };
            container.updateOrbitalStats(target.id, 1);

            expect(container.state.name).toBe(target.name);
        });
    });

    describe('getTime()', () => {
        it('should return a formatted time string', () => {
            (ref.current! as any).props = { time: 1000 };
            const result = ref.current!.getTime();
            expect(typeof result).toBe('string');
        });
    });
});
