import * as Actions from '../LabelActions';
import ActionType from '../../constants/Actions';

describe('Label Actions', () => {
    describe('setActiveOrbital()', () => {
        it('should be of type SET_ACTIVE_ORBITAL with the targetId payload', () => {
            const targetId = 'Mars';
            const result = Actions.setActiveOrbital(targetId);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('targetId');
            expect(result.type).toEqual(ActionType.SET_ACTIVE_ORBITAL);
            expect(result.targetId).toEqual(targetId);
        });
    });

    describe('setLabelText()', () => {
        it('should be of type SET_LABEL_TEXT with the setLabelText payload', () => {
            const labelText = 'Mars';
            const result = Actions.setLabelText(labelText);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('labelText');
            expect(result.type).toEqual(ActionType.SET_LABEL_TEXT);
            expect(result.labelText).toEqual(labelText);
        });
    });

    describe('addHighlightedOrbital()', () => {
        it('should be of type ADD_HIGHLIGHTED_ORBITAL with the highlightedOrbital payload', () => {
            const highlightedOrbital = 'Mars';
            const result = Actions.addHighlightedOrbital(highlightedOrbital);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('highlightedOrbital');
            expect(result.type).toEqual(ActionType.ADD_HIGHLIGHTED_ORBITAL);
            expect(result.highlightedOrbital).toEqual(highlightedOrbital);
        });
    });

    describe('removeHighlightedOrbital()', () => {
        it('should be of type REMOVE_HIGHLIGHTED_ORBITAL with the highlightedOrbital payload', () => {
            const highlightedOrbital = 'Mars';
            const result = Actions.removeHighlightedOrbital(highlightedOrbital);
      
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('highlightedOrbital');
            expect(result.type).toEqual(ActionType.REMOVE_HIGHLIGHTED_ORBITAL);
            expect(result.highlightedOrbital).toEqual(highlightedOrbital);
        });
    });
});
