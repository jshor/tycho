import reducer from '../EventReducer';
import Actions from '../../constants/Actions';

describe('Data Reducer', () => {
    it('should return the state', () => {
        const state = {orbitalData: {}};
        const result = reducer(state, {});

        expect(result).toEqual(state);
    });

    it('should handle SET_TOUCHED', () => {
        const touched = true;
        const result = reducer(undefined, {
            type: Actions.SET_TOUCHED,
            touched
        });

        expect(result).toEqual({touched});
    });

    it('should handle SET_RELEASED', () => {
        const released = true;
        const result = reducer(undefined, {
            type: Actions.SET_RELEASED,
            released
        });

        expect(result).toEqual({released});
    });
});
