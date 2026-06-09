import ReduxService from '../services/ReduxService';
import Actions from '../constants/Actions';

export default function(state = {}, payload) {
    const assign = (...props) => ReduxService.assign(state, payload, ...props);

    switch(payload.type) {
        case Actions.ZOOM_CHANGE:
            return assign('zoom');
        case Actions.CAMERA_PANNED:
            return assign('newVector');
        case Actions.SPEED_CHANGE:
            return assign('speed');
        case Actions.SCALE_CHANGE:
            return assign('scale');
        case Actions.TIME_OFFSET_CHANGE:
            return assign('timeOffset');
        case Actions.SET_UI_CONTROLS:
            return assign('controlsEnabled');
        case Actions.MODAL_ACTIVE:
            return assign('activeModal');
        case Actions.SETTINGS_ACTIVE:
            return assign('settingsActive');
        case Actions.SET_VOLUME:
            return assign('volume');
        default:
            return state;
    }
}
