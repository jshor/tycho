import React from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import SpinLabel from '../components/SpinLabel'
import ReduxService from '../services/ReduxService'
import * as TourActions from '../actions/TourActions'
import * as UIControlsActions from '../actions/UIControlsActions'
import Constants from '../constants'

export interface Props {
  isComplete?: boolean
  isAutoOrbitEnabled?: boolean
  touched?: number
  released?: number
  action?: Pick<BoundActions, 'setCameraOrbit' | 'setUIControls'>
}

export class SpinLabelContainer extends React.Component<Props> {
  componentDidUpdate = (prevProps: Props) => {
    this.maybeStopSpinPrompt(prevProps)
  }

  maybeStopSpinPrompt = (prevProps: Props) => {
    if (prevProps.touched !== this.props.touched && this.isVisible()) {
      this.props.action.setCameraOrbit(false)
      this.props.action.setUIControls(true)
    }
  }

  isVisible = (): boolean => {
    const { isComplete, isAutoOrbitEnabled } = this.props
    return isComplete && isAutoOrbitEnabled
  }

  render() {
    return <SpinLabel show={this.isVisible()} count={Constants.UI.SPIN_LABEL_ARROW_COUNT} />
  }
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
