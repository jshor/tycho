import React from 'react';
import { render } from '@testing-library/react';
import Modal from './Modal';

describe('Modal Component', () => {
    it('should render without crashing', () => {
        const { container } = render(<Modal modalActive={false} title="Test" closeModal={vi.fn()} />);
        expect(container).toBeTruthy();
    });
});
