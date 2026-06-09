import Actions from '../constants/Actions';

export const setTouched = (touched) => {
    return {
        type: Actions.SET_TOUCHED,
        touched
    };
}

export const setReleased = (released) => {
    return {
        type: Actions.SET_RELEASED,
        released
    };
}