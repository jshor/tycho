import Actions from '../constants/Actions';

export const setTime = (time) => {
    return {
        type: Actions.SET_TIME,
        time
    };
}

export const setPlaying = (playing) => {
    return {
        type: Actions.SET_PLAYING,
        playing
    }
}
