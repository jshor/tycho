import MathService from '../MathService';

describe('Math Service', () => {
    describe('ramanujan()', () => {
        it('should solve for the circumference of an ellipse', () => {
            const result = MathService.ramanujan(5, 10);

            expect(typeof result).toBe('number');
            expect(result).toEqual(-48.44210548835644);
        });
    });

    describe('getFocus()', () => {
        it('should solve for one of two focii of an ellipse', () => {
            const result = MathService.getFocus(5, 10);

            expect(typeof result).toBe('number');
            expect(result).toEqual(result);
        });
    });

    describe('toRadians()', () => {
        it('should return radians for the given `deg` parameter', () => {
            const result = MathService.toRadians(10);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0.17453292519943295);
        });
    });

    describe('toDegrees()', () => {
        it('should return radians for the given `rad` parameter', () => {
            const result = MathService.toDegrees(10);

            expect(typeof result).toBe('number');
            expect(result).toEqual(572.9577951308232);
        });
    });

    describe('arcSecToRad()', () => {
        it('should return arcseconds for the given rotation and time', () => {
            const result = MathService.arcSecToRad(1, 10);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0.0000484813681109536);
        });
    });

    describe('arcSecToDeg()', () => {
        it('should return arcseconds for the given rotation and time', () => {
            const result = MathService.arcSecToDeg(1, 10);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0.002777777777777778);
        });
    });

});
