import * as Actions from '../EventActions';
import ActionType from '../../constants/Actions';

describe('Event Actions', () => {
    describe('setTouched()', () => {
        it('should be of type SET_TOUCHED with the touched payload', () => {
            const touched = true;
            const result = Actions.setTouched(touched);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('touched');
            expect(result.type).toEqual(ActionType.SET_TOUCHED);
            expect(result.touched).toEqual(touched);
        });
    });

    describe('setReleased()', () => {
        it('should be of type SET_RELEASED with the released payload', () => {
            const released = true;
            const result = Actions.setReleased(released);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('released');
            expect(result.type).toEqual(ActionType.SET_RELEASED);
            expect(result.released).toEqual(released);
        });
    });
});
