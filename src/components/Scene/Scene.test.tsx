import React from 'react';
import { render } from '@testing-library/react';
import Scene from '../Scene';
import data from './__fixtures__/orbitals.json';

describe('Scene Component', () => {
    let ref: React.RefObject<Scene>;

    beforeEach(() => {
        ref = React.createRef<Scene>();
        render(
            <Scene
                orbitalData={data as any}
                time={1}
                ref={ref as any}
            />
        );
    });

    describe('getOrbitalElements()', () => {
        it('should return an array', () => {
            const result = ref.current!.getOrbitalElements(data as any);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should return one element per orbital', () => {
            const result = ref.current!.getOrbitalElements(data as any);
            expect(result).toHaveLength(data.length);
        });
    });

    describe('render()', () => {
        it('should render without crashing', () => {
            const { container } = render(
                <Scene orbitalData={data as any} time={1} />
            );
            expect(container).toBeTruthy();
        });
    });
});
