import reducer from '../TourReducer';
import Actions from '../../constants/Actions';

describe('Tour Reducer', () => {
    it('should return the state', () => {
        const state = {isAutoOrbitEnabled: true};
        const result = reducer(state, {});

        expect(result).toEqual(state);
    });

    it('should handle SET_ACTIVE_ORBITAL', () => {
        const isAutoOrbitEnabled = true;
        const result = reducer(undefined, {
            type: Actions.SET_CAMERA_ORBIT,
            isAutoOrbitEnabled
        });

        expect(result).toEqual({isAutoOrbitEnabled});
    });

    it('should handle TOUR_COMPLETED', () => {
        const isComplete = true;
        const result = reducer(undefined, {
            type: Actions.TOUR_COMPLETED,
            isComplete
        });

        expect(result).toEqual({isComplete});
    });

    it('should handle TOUR_SKIPPED', () => {
        const isSkipped = true;
        const result = reducer(undefined, {
            type: Actions.TOUR_SKIPPED,
            isSkipped
        });

        expect(result).toEqual({isSkipped});
    });
});
