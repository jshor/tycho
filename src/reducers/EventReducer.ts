import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';

export default function(state = {}, payload) {
    const assign = (...props) => ReduxService.assign(state, payload, ...props);

    switch(payload.type) {
        case Actions.SET_TOUCHED:
            return assign('touched');
        case Actions.SET_RELEASED:
            return assign('released');
        default:
            return state;
    }
}