import { AnyAction } from 'redux';
import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';
import { EventState } from '../types';

export default function eventReducer(state: EventState = {}, payload: AnyAction): EventState {
    const assign = (...props: string[]) => ReduxService.assign(state, payload, ...props);

    switch (payload.type) {
        case Actions.SET_TOUCHED:
            return assign('touched');
        case Actions.SET_RELEASED:
            return assign('released');
        default:
            return state;
    }
}
