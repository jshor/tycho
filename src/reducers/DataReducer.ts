import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';

export default function(state = {}, payload) {
    const assign = (...props) => ReduxService.assign(state, payload, ...props);

    switch(payload.type) {
        case Actions.SET_ORBITAL_DATA:
            return assign('orbitalData');
        case Actions.SET_PAGE_TEXT:
            return assign('pageText');
        default:
            return state;
    }
}
