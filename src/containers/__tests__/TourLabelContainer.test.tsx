import React from 'react';
import { render } from '@testing-library/react';
import TourLabelContainer from '../TourLabelContainer';

vi.useFakeTimers();

describe('Tour Label Container', () => {
    describe('componentDidMount()', () => {
        it('should schedule show and hide via setTimeout', () => {
            const spy = vi.spyOn(global, 'setTimeout');

            render(<TourLabelContainer text="Hello" start={100} end={5000} />);

            expect(spy).toHaveBeenCalledTimes(2);
        });
    });

    describe('setClassAsync()', () => {
        it('should update modifier state after the timeout fires', () => {
            const ref = React.createRef<TourLabelContainer>();
            render(<TourLabelContainer text="Hello" start={100} end={5000} ref={ref as any} />);

            expect(ref.current!.state.modifier).toBe('hide');

            vi.advanceTimersByTime(100);
            expect(ref.current!.state.modifier).toBe('show');

            vi.advanceTimersByTime(5000);
            expect(ref.current!.state.modifier).toBe('hide');
        });

        it('should not update state after unmount', () => {
            const ref = React.createRef<TourLabelContainer>();
            const { unmount } = render(
                <TourLabelContainer text="Hello" start={100} end={5000} ref={ref as any} />
            );

            unmount();

            expect(() => vi.advanceTimersByTime(10000)).not.toThrow();
        });
    });
});
