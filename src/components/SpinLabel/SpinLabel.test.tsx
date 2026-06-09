import React from 'react';
import { render } from '@testing-library/react';
import SpinLabel from './SpinLabel';

describe('SpinLabel Component', () => {
    it('should render without crashing', () => {
        const { container } = render(<SpinLabel show={true} count={3} />);
        expect(container).toBeTruthy();
    });
});
