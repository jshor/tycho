import reducer from '../LabelReducer';
import Actions from '../../constants/Actions';

describe('Label Reducer', () => {
    it('should return the state', () => {
        const state = {targetId: 'Mars'};
        const result = reducer(state, {});

        expect(result).toEqual(state);
    });

    it('should handle SET_ACTIVE_ORBITAL', () => {
        const targetId = 'Mars';
        const result = reducer(undefined, {
            type: Actions.SET_ACTIVE_ORBITAL,
            targetId
        });

        expect(result).toEqual({targetId});
    });
  
    it('should handle SET_LABEL_TEXT', () => {
        const labelText = 'Mars';
        const result = reducer(undefined, {
            type: Actions.SET_LABEL_TEXT,
            labelText
        });

        expect(result).toEqual({labelText});
    });

    describe('ADD_HIGHLIGHTED_ORBITAL', () => {
        const highlightedOrbital = 'Mars';

        it('should add the highlighted orbital to the existing list', () => {
            const highlightedOrbitals = ['Earth'];
            const result = reducer({highlightedOrbitals}, {
                type: Actions.ADD_HIGHLIGHTED_ORBITAL,
                highlightedOrbital
            });

            expect(result).toHaveProperty('highlightedOrbitals');
            expect(Array.isArray(result.highlightedOrbitals)).toBe(true);
            expect(result.highlightedOrbitals).toHaveLength(2);
            expect(result.highlightedOrbitals).toEqual([
                ...highlightedOrbitals,
                highlightedOrbital
            ]);
        });

        it('should create a new list containing the highlighted orbital', () => {
            const result = reducer({}, {
                type: Actions.ADD_HIGHLIGHTED_ORBITAL,
                highlightedOrbital
            });

            expect(result).toHaveProperty('highlightedOrbitals');
            expect(Array.isArray(result.highlightedOrbitals)).toBe(true);
            expect(result.highlightedOrbitals).toHaveLength(1);
            expect(result.highlightedOrbitals).toEqual([highlightedOrbital]);
        });
    });

    describe('REMOVE_HIGHLIGHTED_ORBITAL', () => {
        const highlightedOrbital = 'Mars';

        it('should remove the highlighted orbital from the existing list', () => {
            const highlightedOrbitals = ['Earth', highlightedOrbital];
            const result = reducer({highlightedOrbitals}, {
                type: Actions.REMOVE_HIGHLIGHTED_ORBITAL,
                highlightedOrbital
            });

            expect(result).toHaveProperty('highlightedOrbitals');
            expect(Array.isArray(result.highlightedOrbitals)).toBe(true);
            expect(result.highlightedOrbitals).toHaveLength(1);
            expect(result.highlightedOrbitals).not.toContain([highlightedOrbital]);
        });

        it('should create a new list containing the highlighted orbital', () => {
            const result = reducer({}, {
                type: Actions.REMOVE_HIGHLIGHTED_ORBITAL,
                highlightedOrbital
            });

            expect(result).toHaveProperty('highlightedOrbitals');
            expect(Array.isArray(result.highlightedOrbitals)).toBe(true);
            expect(result.highlightedOrbitals).toHaveLength(0);
            expect(result.highlightedOrbitals).not.toContain([highlightedOrbital]);
        });
    });
});
