import Actions from '../constants/Actions';

export const changeZoom = (zoom) => {
    return {
        type: Actions.ZOOM_CHANGE,
        zoom
    };
}

export const changeSpeed = (speed) => {
    return {
        type: Actions.SPEED_CHANGE,
        speed
    };
}

export const changeScale = (scale) => {
    return {
        type: Actions.SCALE_CHANGE,
        scale
    };
}

export const changeTimeOffset = (timeOffset) => {
    return {
        type: Actions.TIME_OFFSET_CHANGE,
        timeOffset
    };
}

export const setUIControls = (controlsEnabled) => {
    return {
        type: Actions.SET_UI_CONTROLS,
        controlsEnabled
    };
}

export const toggleModal = (activeModal) => {
    return {
        type: Actions.MODAL_ACTIVE,
        activeModal
    };
}

export const toggleSettings = (settingsActive) => {
    return {
        type: Actions.SETTINGS_ACTIVE,
        settingsActive
    };
}

export const setVolume = (volume) => {
    return {
        type: Actions.SET_VOLUME,
        volume
    }
}
