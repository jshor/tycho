import { useEffect, useRef } from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import SpinLabel from '../components/SpinLabel'
import ReduxService from '../services/ReduxService'
import * as TourActions from '../actions/TourActions'
import * as UIControlsActions from '../actions/UIControlsActions'
import Constants from '../constants'

export interface Props {
  /** Whether or not the tour has finished playing. */
  isComplete?: boolean
  /** Whether or not the camera is orbiting its target on its own. */
  isAutoOrbitEnabled?: boolean
  /** Time when the user last began interacting with the scene. */
  touched?: number
  /** Time when the user last stopped interacting with the scene. */
  released?: number
  /** Store actions. */
  action?: Pick<BoundActions, 'setCameraOrbit' | 'setUIControls'>
}

/**
 * Prompts the user to spin the camera.
 */
export function SpinLabelContainer({ isComplete, isAutoOrbitEnabled, touched, action }: Props) {
  const previousTouched = useRef(touched)

  /** Whether or not the prompt is visible. */
  const isVisible = (): boolean => isComplete && isAutoOrbitEnabled

  /** Hands the camera to the user the first time they reach for the scene. */
  useEffect(() => {
    if (previousTouched.current === touched) return

    previousTouched.current = touched

    if (isVisible()) {
      action.setCameraOrbit(false)
      action.setUIControls(true)
    }
  }) // eslint-disable-line react-hooks/exhaustive-deps

  return <SpinLabel show={isVisible()} count={Constants.UI.SPIN_LABEL_ARROW_COUNT} />
}

export default connect(
  ReduxService.mapStateToProps<Props>(
    'tour.isComplete',
    'tour.isAutoOrbitEnabled',
    'event.touched',
    'event.released'
  ),
  ReduxService.mapDispatchToProps<Props['action']>(TourActions, UIControlsActions)
)(SpinLabelContainer)
