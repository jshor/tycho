import React from 'react';
import { render } from '@testing-library/react';
import DatePicker from './DatePicker';

describe('DatePicker Component', () => {
    it('should render without crashing', () => {
        const { container } = render(<DatePicker onClick={vi.fn()} uxTime="2024-01-01" />);
        expect(container).toBeTruthy();
    });
});
