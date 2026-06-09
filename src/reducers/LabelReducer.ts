import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';

export default function (state = {}, payload) {
    const assign = (...props) => ReduxService.assign(state, payload, ...props);

    /**
     * Adds highlighted orbital from payload to state.
     *
     * @private
     * @return {String[]} new list of highlighted orbitals
     */
    const addHighlightedOrbital = () => {
        const { highlightedOrbitals } = state;
        const { highlightedOrbital } = payload;

        if (Array.isArray(highlightedOrbitals)) {
            return [...highlightedOrbitals, highlightedOrbital];
        }
        return [highlightedOrbital];
    };

    /**
     * Removes highlighted orbital specified in payload from state.
     *
     * @private
     * @return {String[]} new list of highlighted orbitals
     */
    const removeHighlightedOrbital = () => {
        const { highlightedOrbitals } = state;
        const { highlightedOrbital } = payload;

        if (Array.isArray(highlightedOrbitals)) {
            return highlightedOrbitals.filter((orbital) => {
                return orbital !== highlightedOrbital;
            });
        }
        return [];
    }

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
