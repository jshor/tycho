import store from '../';

describe('Store', () => {
    it('should return an object', () => {
        expect(typeof store({})).toBe('object');
    });
});
