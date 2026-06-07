import * as Actions from '../LoaderActions';
import ActionType from '../../constants/Actions';

describe('Loader Actions', () => {
    describe('setPercentLoaded()', () => {
        it('should be of type SET_PERCENT_LOADED with the calculated percentage payload', () => {
            const percent = 50;
            const result = Actions.setPercentLoaded(5, 10);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('percent');
            expect(result.type).toEqual(ActionType.SET_PERCENT_LOADED);
            expect(result.percent).toEqual(percent);
        });
    });

    describe('setTextureLoaded()', () => {
        it('should be of type SET_TEXTURE_LOADED with the given url payload', () => {
            const url = 'myImage.jpg';
            const result = Actions.setTextureLoaded(url);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('url');
            expect(result.type).toEqual(ActionType.SET_TEXTURE_LOADED);
            expect(result.url).toEqual(url);
        });
    });
});
