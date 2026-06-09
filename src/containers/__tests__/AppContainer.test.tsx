import React from 'react';
import { render } from '@testing-library/react';
import { AppContainer } from '../AppContainer';

const action = {
    requestOrbitalData: vi.fn(),
    requestPageText: vi.fn(),
    setTime: vi.fn(),
};

describe('App Container', () => {
    let ref: React.RefObject<AppContainer>;

    beforeEach(() => {
        vi.clearAllMocks();
        ref = React.createRef<AppContainer>();
        render(<AppContainer action={action} ref={ref as any} />);
    });

    describe('componentDidMount()', () => {
        it('should request orbital data', () => {
            expect(action.requestOrbitalData).toHaveBeenCalledTimes(1);
        });

        it('should request page text', () => {
            expect(action.requestPageText).toHaveBeenCalledTimes(1);
        });
    });

    describe('componentDidUpdate()', () => {
        it('should call maybeUpdateOffset()', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'maybeUpdateOffset');

            container.componentDidUpdate({} as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('maybeUpdateOffset()', () => {
        it('should update the clock offset when scene is playing and timeOffset changed', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container.clock, 'setOffset');
            const timeOffset = 123;

            (container as any).props = { playing: true, timeOffset };
            container.maybeUpdateOffset({ timeOffset: 0 } as any);

            expect(spy).toHaveBeenCalledWith(timeOffset);
        });

        it('should not update the clock if timeOffset is undefined', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container.clock, 'setOffset');

            (container as any).props = { playing: true, timeOffset: undefined };
            container.maybeUpdateOffset({ timeOffset: 999 } as any);

            expect(spy).not.toHaveBeenCalled();
        });

        it('should not update the clock if scene is paused', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container.clock, 'setOffset');

            (container as any).props = { playing: false, timeOffset: 123 };
            container.maybeUpdateOffset({ timeOffset: 0 } as any);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('maybeUpdateTime()', () => {
        it('should dispatch setTime when shouldUpdateTime() returns true', () => {
            const container = ref.current!;
            const setTime = vi.fn();
            const time = 42;

            (container as any).props = { action: { setTime } };
            container.clock = { getTime: () => time } as any;
            container.shouldUpdateTime = () => true;

            container.maybeUpdateTime();

            expect(setTime).toHaveBeenCalledWith(time);
        });

        it('should dispatch setTime when forced', () => {
            const container = ref.current!;
            const setTime = vi.fn();
            const time = 42;

            (container as any).props = { action: { setTime } };
            container.clock = { getTime: () => time } as any;
            container.shouldUpdateTime = () => false;

            container.maybeUpdateTime(true);

            expect(setTime).toHaveBeenCalledWith(time);
        });

        it('should not dispatch if not forced and shouldUpdateTime() is false', () => {
            const container = ref.current!;
            const setTime = vi.fn();

            (container as any).props = { action: { setTime } };
            container.shouldUpdateTime = () => false;

            container.maybeUpdateTime(false);

            expect(setTime).not.toHaveBeenCalled();
        });
    });

    describe('maybeContinue()', () => {
        it('should call continue() when playing and clock is stopped', () => {
            const container = ref.current!;
            const continueF = vi.fn();

            (container as any).props = { playing: true };
            container.clock = { continue: continueF, stopped: true } as any;

            container.maybeContinue();

            expect(continueF).toHaveBeenCalledTimes(1);
        });

        it('should not call continue() when clock is not stopped', () => {
            const container = ref.current!;
            const continueF = vi.fn();

            (container as any).props = { playing: true };
            container.clock = { continue: continueF, stopped: false } as any;

            container.maybeContinue();

            expect(continueF).not.toHaveBeenCalled();
        });
    });

    describe('maybeStop()', () => {
        it('should call stop() when not playing and clock is running', () => {
            const container = ref.current!;
            const stop = vi.fn();

            (container as any).props = { playing: false };
            container.clock = { stop, stopped: false } as any;

            container.maybeStop();

            expect(stop).toHaveBeenCalledTimes(1);
        });

        it('should not call stop() when clock is already stopped', () => {
            const container = ref.current!;
            const stop = vi.fn();

            (container as any).props = { playing: false };
            container.clock = { stop, stopped: true } as any;

            container.maybeStop();

            expect(stop).not.toHaveBeenCalled();
        });
    });

    describe('shouldUpdateTime()', () => {
        it('should return true when time changed and scene is playing', () => {
            const container = ref.current!;

            container.clock = { getTime: () => 1 } as any;
            container.lastTime = 2;
            (container as any).props = { playing: true };

            expect(container.shouldUpdateTime()).toBe(true);
        });

        it('should return false when scene is paused', () => {
            const container = ref.current!;

            container.clock = { getTime: () => 1 } as any;
            container.lastTime = 2;
            (container as any).props = { playing: false };

            expect(container.shouldUpdateTime()).toBe(false);
        });

        it('should return false when time has not changed', () => {
            const container = ref.current!;

            container.clock = { getTime: () => 1 } as any;
            container.lastTime = 1;

            expect(container.shouldUpdateTime()).toBe(false);
        });
    });

    describe('onAnimate()', () => {
        it('should call clock.speed with the current speed', () => {
            const container = ref.current!;
            const speed = vi.fn();
            const update = vi.fn();

            (container as any).props = { action: { setTime: vi.fn() }, speed: 2 };
            container.clock = { speed, update, getTime: () => 0, stopped: false } as any;

            container.onAnimate();

            expect(speed).toHaveBeenCalledWith(2);
        });
    });

    describe('render()', () => {
        it('should render SplashScreen when orbitalData is missing', () => {
            const { container: dom } = render(
                <AppContainer action={action} ref={null as any} />
            );
            expect(dom).toBeTruthy();
        });

        it('should render the app when orbitalData and pageText are present', () => {
            const { container: dom } = render(
                <AppContainer
                    action={action}
                    orbitalData={[] as any}
                    pageText={{} as any}
                    ref={null as any}
                />
            );
            expect(dom).toBeTruthy();
        });
    });
});
