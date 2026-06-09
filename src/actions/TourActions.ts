import Actions from '../constants/Actions';

export const setCameraOrbit = (isAutoOrbitEnabled) => {
    return {
        type: Actions.SET_CAMERA_ORBIT,
        isAutoOrbitEnabled
    };
}

export const tourCompleted = (isComplete) => {
    return {
        type: Actions.TOUR_COMPLETED,
        isComplete
    }
}

export const tourSkipped = (isSkipped) => {
    return {
        type: Actions.TOUR_SKIPPED,
        isSkipped
    }
}
