import reducer from '../LoaderReducer';
import Actions from '../../constants/Actions';

describe('Loader Reducer', () => {
    it('should return the state', () => {
        const state = {targetId: 'Mars'};
        const result = reducer(state, {});

        expect(result).toEqual(state);
    });

    it('should handle SET_TEXTURE_LOADED', () => {
        const url = 'myImage.jpg';
        const result = reducer(undefined, {
            type: Actions.SET_TEXTURE_LOADED,
            url
        });

        expect(result).toEqual({url});
    });

    it('should handle SET_PERCENT_LOADED', () => {
        const percent = 50;
        const result = reducer(undefined, {
            type: Actions.SET_PERCENT_LOADED,
            percent
        });

        expect(result).toEqual({percent});
    });
});
