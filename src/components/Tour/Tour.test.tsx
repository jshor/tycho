import React from 'react';
import { render } from '@testing-library/react';
import Tour from './Tour';

describe('Tour Component', () => {
    it('should render without crashing', () => {
        const { container } = render(<Tour pageText={{} as any} skipTour={vi.fn()} labels={[]} />);
        expect(container).toBeTruthy();
    });
});
