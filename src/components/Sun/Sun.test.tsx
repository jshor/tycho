import React from 'react';
import { render } from '@testing-library/react';
import Sun from './Sun';
import LensFlareHelper from '../../utils/LensFlare';

// Sun is now a functional component using useRef + useEffect.
// LensFlareHelper and R3F are mocked globally.

describe('Sun Component', () => {
    it('should render without crashing', () => {
        expect(() => render(<Sun />)).not.toThrow();
    });

    it('should instantiate LensFlareHelper on mount', () => {
        const spy = vi.spyOn(LensFlareHelper.prototype, 'constructor' as any);
        render(<Sun />);
        // LensFlareHelper is mocked; verify the mock was called
        expect(LensFlareHelper).toHaveBeenCalled();
    });
});
