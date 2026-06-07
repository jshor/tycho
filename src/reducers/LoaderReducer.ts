import { AnyAction } from 'redux';
import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';
import { LoaderState } from '../types';

export default function loaderReducer(state: LoaderState = {}, payload: AnyAction): LoaderState {
    const assign = (...props: string[]) => ReduxService.assign(state, payload, ...props);

    switch (payload.type) {
        case Actions.SET_PERCENT_LOADED:
            return assign('percent');
        case Actions.SET_TEXTURE_LOADED:
            return assign('url');
        default:
            return state;
    }
}
