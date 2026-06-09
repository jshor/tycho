import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';

export default function(state = {}, payload) {
    const assign = (...props) => ReduxService.assign(state, payload, ...props);

    switch(payload.type) {
        case Actions.SET_PERCENT_LOADED:
            return assign('percent');
        case Actions.SET_TEXTURE_LOADED:
            return assign('url');
        default:
            return state;
    }
}
