import Scale, { getVisibleRadius } from '../Scale';
import Constants from '../../constants';

describe('Scale', () => {
    it('should be a number', () => {
        const result = Scale(5);
        expect(typeof result).toBe('number');
    });
});

describe('getVisibleRadius', () => {
    const min = Constants.WebGL.MINIMUM_RADIUS;

    it('should inflate radii below the minimum up to the minimum', () => {
        expect(getVisibleRadius(1)).toBe(min);
        expect(getVisibleRadius(min - 1)).toBe(min);
    });

    it('should leave radii at or above the minimum unchanged', () => {
        expect(getVisibleRadius(min)).toBe(min);
        expect(getVisibleRadius(min + 500)).toBe(min + 500);
        expect(getVisibleRadius(69911)).toBe(69911);
    });
});
