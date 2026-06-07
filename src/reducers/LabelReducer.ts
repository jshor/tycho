import { AnyAction } from 'redux';
import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';
import { LabelState } from '../types';

export default function labelReducer(state: LabelState = {}, payload: AnyAction): LabelState {
    const assign = (...props: string[]) => ReduxService.assign(state, payload, ...props);

    const addHighlightedOrbital = (): string[] => {
        const { highlightedOrbitals } = state;
        const { highlightedOrbital } = payload;

        if (Array.isArray(highlightedOrbitals)) {
            return [...highlightedOrbitals, highlightedOrbital];
        }
        return [highlightedOrbital];
    };

    const removeHighlightedOrbital = (): string[] => {
        const { highlightedOrbitals } = state;
        const { highlightedOrbital } = payload;

        if (Array.isArray(highlightedOrbitals)) {
            return highlightedOrbitals.filter((orbital) => orbital !== highlightedOrbital);
        }
        return [];
    };

    switch (payload.type) {
        case Actions.SET_ACTIVE_ORBITAL:
            return Object.assign({}, state, {
                targetId: payload.targetId,
                targetName: payload.targetName
            });

        case Actions.SET_LABEL_TEXT:
            return assign('labelText');

        case Actions.ADD_HIGHLIGHTED_ORBITAL:
            return Object.assign({}, state, {
                highlightedOrbitals: addHighlightedOrbital()
            });

        case Actions.REMOVE_HIGHLIGHTED_ORBITAL:
            return Object.assign({}, state, {
                highlightedOrbitals: removeHighlightedOrbital()
            });

        default:
            return state;
    }
}
