import Actions from '../constants/Actions';
import { ReduxAction } from '../types';

export const setTouched = (touched: number): ReduxAction => ({
    type: Actions.SET_TOUCHED,
    touched
});

export const setReleased = (released: number): ReduxAction => ({
    type: Actions.SET_RELEASED,
    released
});
