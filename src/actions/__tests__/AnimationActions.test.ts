import * as Actions from '../AnimationActions';
import ActionType from '../../constants/Actions';

describe('Animation Actions', () => {
    describe('setTime()', () => {
        it('should be of type SET_TIME with the time payload', () => {
            const time = 1;
            const result = Actions.setTime(time);
      
            expect(result).toHaveProperty('time');
            expect(result.type).toEqual(ActionType.SET_TIME);
            expect(result.time).toEqual(time);
        });
    });

    describe('setPlaying()', () => {
        it('should be of type SET_PLAYING with the playing boolean', () => {
            const playing = true;
            const result = Actions.setPlaying(playing);
      
            expect(result).toHaveProperty('playing');
            expect(result.type).toEqual(ActionType.SET_PLAYING);
            expect(result.playing).toEqual(playing);
        });
    });
});
 
