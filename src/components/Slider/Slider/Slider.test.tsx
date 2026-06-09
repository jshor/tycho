import React from 'react';
import { render } from '@testing-library/react';
import Slider from './Slider';

describe('Slider Component', () => {
    let ref: React.RefObject<Slider>;

    beforeEach(() => {
        ref = React.createRef<Slider>();
        render(
            <Slider onChange={vi.fn()} orientation="horizontal" value={40} ref={ref as any} />
        );
    });

    describe('getInitialValue()', () => {
        it('should return 0 when value prop is undefined', () => {
            (ref.current! as any).props = { value: undefined };
            expect(ref.current!.getInitialValue()).toBe(0);
        });

        it('should return the value prop when defined', () => {
            (ref.current! as any).props = { value: 10 };
            expect(ref.current!.getInitialValue()).toBe(10);
        });
    });

    describe('getClassName()', () => {
        it('should include the sub-component name and orientation', () => {
            const result = ref.current!.getClassName('handle');
            expect(result).toBe('slider__handle slider__handle--horizontal');
        });

        it('should return the base class name when no sub-name given', () => {
            const result = ref.current!.getClassName();
            expect(result).toBe('slider slider--horizontal');
        });
    });

    describe('render()', () => {
        it('should render without crashing', () => {
            const { container } = render(
                <Slider onChange={vi.fn()} orientation="vertical" value={50} />
            );
            expect(container).toBeTruthy();
        });
    });
});
