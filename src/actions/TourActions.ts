import Actions from '../constants/Actions'
import { ReduxAction } from '../types'

export const setCameraOrbit = (isAutoOrbitEnabled: boolean): ReduxAction => ({
  type: Actions.SET_CAMERA_ORBIT,
  isAutoOrbitEnabled
})

export const tourCompleted = (isComplete: boolean): ReduxAction => ({
  type: Actions.TOUR_COMPLETED,
  isComplete
})