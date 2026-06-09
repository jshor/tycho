import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';

export default function(state = {}, payload) {
    const assign = (...props) => ReduxService.assign(state, payload, ...props);

    switch(payload.type) {
        case Actions.SET_CAMERA_ORBIT:
            return assign('isAutoOrbitEnabled');
        case Actions.TOUR_COMPLETED:
            return assign('isComplete');
        case Actions.TOUR_SKIPPED:
            return assign('isSkipped');
        default:
            return state;
    }
}
