import Scale from '../Scale';

describe('Scale', () => {
    it('should be a number', () => {
        const result = Scale(5);
        expect(typeof result).toBe('number');
    });
});
