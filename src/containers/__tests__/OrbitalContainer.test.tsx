import React from 'react';
import { render } from '@testing-library/react';
import data from './__fixtures__/orbitals.json';
import { OrbitalContainer } from '../OrbitalContainer';
import OrbitalService from '../../services/OrbitalService';
import Ellipse from '../../utils/Ellipse';
import Constants from '../../constants';

const action = {
    setActiveOrbital: vi.fn(),
    addHighlightedOrbital: vi.fn(),
    removeHighlightedOrbital: vi.fn(),
};

describe('Orbital Container', () => {
    let ref: React.RefObject<OrbitalContainer>;

    beforeEach(() => {
        vi.clearAllMocks();
        ref = React.createRef<OrbitalContainer>();
        render(
            <OrbitalContainer
                {...(data[0] as any)}
                time={1}
                action={action}
                ref={ref as any}
            />
        );
    });

    afterEach(() => vi.resetAllMocks());

    describe('constructor()', () => {
        it('should initialize an Ellipse instance', () => {
            expect(ref.current!.ellipse).toBeInstanceOf(Ellipse);
        });

        it('should initialize group rotations in state', () => {
            expect(ref.current!.state).toHaveProperty('eclipticGroupRotation');
            expect(ref.current!.state).toHaveProperty('orbitalGroupRotation');
        });

        it('should initialize body state', () => {
            expect(ref.current!.state).toHaveProperty('bodyPosition');
            expect(ref.current!.state).toHaveProperty('bodyRotation');
        });
    });

    describe('componentDidUpdate()', () => {
        it('should call maybeUpdateBodyState()', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'maybeUpdateBodyState');

            container.componentDidUpdate({} as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should call maybeUpdatePathOpacity()', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'maybeUpdatePathOpacity');

            container.componentDidUpdate({} as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('maybeUpdateBodyState()', () => {
        it('should call setBodyState() when time has changed', () => {
            const container = ref.current!;
            container.setBodyState = vi.fn();

            const spy = vi.spyOn(container, 'setBodyState');
            (container as any).props = { time: 2 };
            container.maybeUpdateBodyState({ time: 1 } as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should not call setBodyState() when time is unchanged', () => {
            const container = ref.current!;
            container.setBodyState = vi.fn();

            const spy = vi.spyOn(container, 'setBodyState');
            (container as any).props = { time: 1 };
            container.maybeUpdateBodyState({ time: 1 } as any);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('maybeUpdatePathOpacity()', () => {
        it('should call setPathOpacity() when highlightedOrbitals changes', () => {
            const container = ref.current!;
            container.setPathOpacity = vi.fn();

            const spy = vi.spyOn(container, 'setPathOpacity');
            (container as any).props = { highlightedOrbitals: ['Mars'] };
            container.maybeUpdatePathOpacity({ highlightedOrbitals: ['Earth'] } as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should not call setPathOpacity() when highlightedOrbitals is unchanged', () => {
            const container = ref.current!;
            container.setPathOpacity = vi.fn();

            const spy = vi.spyOn(container, 'setPathOpacity');
            const list = ['Mars'];
            (container as any).props = { highlightedOrbitals: list };
            container.maybeUpdatePathOpacity({ highlightedOrbitals: list } as any);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('maybeUpdateScale()', () => {
        const scale = 2;
        const time = 12345;

        beforeEach(() => {
            ref.current!.setBodyState = vi.fn();
            (ref.current! as any).props = { scale: scale + 1 };
        });

        it('should update the ellipse scale when orbital is a satellite', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container.ellipse, 'setScale');

            (container as any).props.isSatellite = true;
            container.maybeUpdateScale({ scale: scale + 1, time } as any);

            expect(spy).toHaveBeenCalledWith(scale + 1);
        });

        it('should not mutate the ellipse scale for non-satellites', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container.ellipse, 'setScale');

            (container as any).props.isSatellite = false;
            container.maybeUpdateScale({ scale: scale + 1, time } as any);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should update the body state after scale changes', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'setBodyState');

            container.maybeUpdateScale({ scale: scale + 1, time } as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('setPathOpacity()', () => {
        it('should update pathOpacity state', () => {
            const container = ref.current!;
            const opacity = Constants.UI.HOVER_OPACITY_ON;
            OrbitalService.getPathOpacity = () => opacity;

            container.setPathOpacity({} as any, 'Earth' as any);

            expect(container.state.pathOpacity).toBe(opacity);
        });
    });

    describe('setGroupRotations()', () => {
        it('should set eclipticGroupRotation and orbitalGroupRotation in state', () => {
            ref.current!.setGroupRotations(ref.current!.props);

            expect(ref.current!.state).toHaveProperty('eclipticGroupRotation');
            expect(ref.current!.state).toHaveProperty('orbitalGroupRotation');
        });
    });

    describe('setBodyState()', () => {
        it('should set bodyPosition and bodyRotation in state', () => {
            OrbitalService.getBodyPosition = () => ({} as any);
            ref.current!.setBodyState(ref.current!.props, ref.current!.ellipse);

            expect(ref.current!.state).toHaveProperty('bodyPosition');
            expect(ref.current!.state).toHaveProperty('bodyRotation');
        });
    });
});
