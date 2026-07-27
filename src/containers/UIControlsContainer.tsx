import React from 'react'
import { connect } from 'react-redux'
import * as Actions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'
import UIControls from '../components/UIControls'
import { PageText, BoundActions } from '../types'

interface Props {
  time?: number
  speed?: number
  zoom?: number
  scale?: number
  controlsEnabled?: boolean
  settingsActive?: boolean
  targetName?: string
  pageText?: PageText
  action?: Pick<BoundActions, 'setUIControls' | 'toggleModal' | 'toggleSettings'>
}

export class UIControlsContainer extends React.Component<Props> {
  toggleSettings = () => {
    this.props.action.toggleSettings(!this.props.settingsActive)
  }

  openModal = (type: string) => {
    this.props.action.toggleModal(type)
    this.props.action.setUIControls(false)
  }

  render() {
    return (
      <UIControls
        openModal={this.openModal}
        toggleSetting={this.toggleSettings}
        {...this.props}
        {...this.props.action}
      />
    )
  }
}

export default connect(
  ReduxService.mapStateToProps<Props>(
    'uiControls.speed',
    'uiControls.zoom',
    'uiControls.scale',
    'uiControls.controlsEnabled',
    'uiControls.settingsActive',
    'label.targetName',
    'data.pageText',
    'animation.time'
  ),
  ReduxService.mapDispatchToProps<Props['action']>(Actions)
)(UIControlsContainer)
