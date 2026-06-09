import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
    it('should render without crashing', () => {
        const { container } = render(<App onAnimate={vi.fn()} pageText={{} as any} />);
        expect(container).toBeTruthy();
    });
});
