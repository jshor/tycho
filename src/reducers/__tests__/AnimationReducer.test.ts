import reducer from '../AnimationReducer';
import Actions from '../../constants/Actions';

describe('Animation Reducer', () => {
    it('should return the state', () => {
        const state = {positions: {}};
        const result = reducer(state, {});

        expect(result).toEqual(state);
    });

    it('should handle SET_PLAYING', () => {
        const playing = true;
        const result = reducer(undefined, {
            type: Actions.SET_PLAYING,
            playing
        });

        expect(result).toEqual({playing});
    });

    it('should handle SET_TIME', () => {
        const time = 1;
        const result = reducer(undefined, {
            type: Actions.SET_TIME,
            time
        });

        expect(result).toEqual({time});
    });
});
