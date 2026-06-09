import React from 'react';
import { render } from '@testing-library/react';
import Cookies from 'js-cookie';
import { VolumeContainer } from '../VolumeContainer';

describe('Volume Container', () => {
    let ref: React.RefObject<VolumeContainer>;
    const setVolume = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        ref = React.createRef<VolumeContainer>();
        render(<VolumeContainer action={{ setVolume }} ref={ref as any} />);
    });

    describe('componentDidUpdate()', () => {
        it('should call setVolume(0) when new volume is truthy but cookie is 0', () => {
            const container = ref.current!;
            container.getVolume = () => 0;

            (container as any).props = { action: { setVolume }, volume: 1 };
            container.componentDidUpdate({ volume: 0 } as any);

            expect(setVolume).toHaveBeenCalledWith(0);
        });

        it('should not call setVolume when new and prev volume are the same', () => {
            const container = ref.current!;
            container.getVolume = () => 0;

            (container as any).props = { action: { setVolume }, volume: 1 };
            container.componentDidUpdate({ volume: 1 } as any);

            expect(setVolume).not.toHaveBeenCalled();
        });

        it('should not call setVolume when cookie volume is truthy', () => {
            const container = ref.current!;
            container.getVolume = () => 1;

            (container as any).props = { action: { setVolume }, volume: 1 };
            container.componentDidUpdate({ volume: 0 } as any);

            expect(setVolume).not.toHaveBeenCalled();
        });
    });

    describe('setVolume()', () => {
        it('should store the volume level in a cookie', () => {
            const spy = vi.spyOn(Cookies, 'set');
            ref.current!.setVolume(1);

            expect(spy).toHaveBeenCalledWith('volume', '1', { expires: 365 });
        });
    });

    describe('getVolume()', () => {
        it('should parse the cookie value as a number', () => {
            vi.spyOn(Cookies, 'get').mockReturnValue('1');
            expect(ref.current!.getVolume()).toBe(1);
        });

        it('should return 1 when the cookie is not set', () => {
            vi.spyOn(Cookies, 'get').mockReturnValue(undefined);
            expect(ref.current!.getVolume()).toBe(1);
        });
    });

    describe('triggerVolume()', () => {
        it('should set volume to 1 when currently 0', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'setVolume');
            container.getVolume = () => 0;
            (container as any).props = { action: { setVolume } };

            container.triggerVolume();

            expect(spy).toHaveBeenCalledWith(1);
            expect(setVolume).toHaveBeenCalledWith(1);
        });

        it('should set volume to 0 when currently 1', () => {
            const container = ref.current!;
            const spy = vi.spyOn(container, 'setVolume');
            container.getVolume = () => 1;
            (container as any).props = { action: { setVolume } };

            container.triggerVolume();

            expect(spy).toHaveBeenCalledWith(0);
            expect(setVolume).toHaveBeenCalledWith(0);
        });
    });
});
