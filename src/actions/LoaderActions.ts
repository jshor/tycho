import Actions from '../constants/Actions';

export const setPercentLoaded = (count, total) => {
    const percent = count / total * 100;
    return {
        type: Actions.SET_PERCENT_LOADED,
        percent
    };
}

export const setTextureLoaded = (url) => {
    return {
        type: Actions.SET_TEXTURE_LOADED,
        url
    };
}