import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';

export default function(state = {}, payload) {
    const assign = (...props) => ReduxService.assign(state, payload, ...props);

    switch(payload.type) {
        case Actions.SET_PLAYING:
            return assign('playing');
        case Actions.SET_TIME:
            return assign('time');
        default:
            return state;
    }
}