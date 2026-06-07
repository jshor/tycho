import { AnyAction } from 'redux';
import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';
import { DataState } from '../types';

export default function dataReducer(state: DataState = {}, payload: AnyAction): DataState {
    const assign = (...props: string[]) => ReduxService.assign(state, payload, ...props);

    switch (payload.type) {
        case Actions.SET_ORBITAL_DATA:
            return assign('orbitalData');
        case Actions.SET_PAGE_TEXT:
            return assign('pageText');
        default:
            return state;
    }
}
