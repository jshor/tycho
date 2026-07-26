import { AnyAction } from 'redux'
import ReduxService from '../services/ReduxService'
import Actions from '../constants/Actions'
import { TourState } from '../types'

export default function tourReducer(state: TourState = {}, payload: AnyAction): TourState {
  const assign = (...props: string[]) => ReduxService.assign(state, payload, ...props)

  switch (payload.type) {
    case Actions.SET_CAMERA_ORBIT:
      return assign('isAutoOrbitEnabled')
    case Actions.TOUR_COMPLETED:
      return assign('isComplete')
    case Actions.TOUR_SKIPPED:
      return assign('isSkipped')
    default:
      return state
  }
}
