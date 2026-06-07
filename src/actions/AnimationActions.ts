import Actions from '../constants/Actions';
import { ReduxAction } from '../types';

export const setTime = (time: number): ReduxAction => ({
    type: Actions.SET_TIME,
    time
});

export const setPlaying = (playing: boolean): ReduxAction => ({
    type: Actions.SET_PLAYING,
    playing
});
