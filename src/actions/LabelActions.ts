import Actions from '../constants/Actions';

export const setActiveOrbital = (targetId, targetName) => {
    return {
        type: Actions.SET_ACTIVE_ORBITAL,
        targetId,
        targetName
    };
}

export const setLabelText = (labelText) => {
    return {
        type: Actions.SET_LABEL_TEXT,
        labelText
    };
}

export const addHighlightedOrbital = (highlightedOrbital) => {
    return {
        type: Actions.ADD_HIGHLIGHTED_ORBITAL,
        highlightedOrbital
    };
}

export const removeHighlightedOrbital = (highlightedOrbital) => {
    return {
        type: Actions.REMOVE_HIGHLIGHTED_ORBITAL,
        highlightedOrbital
    };
}
