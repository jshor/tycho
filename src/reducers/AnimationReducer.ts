import { AnyAction } from 'redux';
import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';
import { AnimationState } from '../types';

export default function animationReducer(state: AnimationState = {}, payload: AnyAction): AnimationState {
    const assign = (...props: string[]) => ReduxService.assign(state, payload, ...props);

    switch (payload.type) {
        case Actions.SET_PLAYING:
            return assign('playing');
        case Actions.SET_TIME:
            return assign('time');
        default:
            return state;
    }
}
