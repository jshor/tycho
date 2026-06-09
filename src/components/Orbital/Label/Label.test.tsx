import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Label from './Label';

// Label is now a functional component using @react-three/drei's Html (mocked globally).

const action = {
    setActiveOrbital: vi.fn(),
    addHighlightedOrbital: vi.fn(),
    removeHighlightedOrbital: vi.fn(),
};

describe('Orbital Label Component', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should render the label text', () => {
        render(<Label text="Earth" id="Earth" action={action} />);
        expect(screen.getByText('Earth')).toBeInTheDocument();
    });

    it('should apply the inactive class when not the target', () => {
        render(<Label text="Earth" id="Earth" action={action} targetId="Mars" />);
        expect(screen.getByText('Earth').className).toContain('inactive');
    });

    it('should apply the active class when it is the target', () => {
        render(<Label text="Earth" id="Earth" action={action} targetId="Earth" />);
        expect(screen.getByText('Earth').className).toContain('active');
    });

    it('should call setActiveOrbital on click', async () => {
        const user = userEvent.setup();
        render(<Label text="Earth" id="Earth" action={action} />);

        await user.click(screen.getByText('Earth'));

        expect(action.setActiveOrbital).toHaveBeenCalledWith('Earth', 'Earth');
    });

    it('should call addHighlightedOrbital on mouse over', async () => {
        const user = userEvent.setup();
        render(<Label text="Earth" id="Earth" action={action} />);

        await user.hover(screen.getByText('Earth'));

        expect(action.addHighlightedOrbital).toHaveBeenCalledWith('Earth');
    });

    it('should call removeHighlightedOrbital on mouse out', async () => {
        const user = userEvent.setup();
        render(<Label text="Earth" id="Earth" action={action} />);

        await user.unhover(screen.getByText('Earth'));

        expect(action.removeHighlightedOrbital).toHaveBeenCalledWith('Earth');
    });
});
