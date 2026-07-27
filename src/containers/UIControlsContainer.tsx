import { connect } from 'react-redux'
import * as Actions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'
import UIControls from '../components/UIControls'
import { PageText, BoundActions } from '../types'

export interface Props {
  /** The current simulation time. */
  time?: number
  /** The speed at which time passes in the simulation. */
  speed?: number
  /** The current zoom level. */
  zoom?: number
  /** The scale applied to the size of each body. */
  scale?: number
  /** Whether or not the user may interact with the controls. */
  controlsEnabled?: boolean
  /** Whether or not the settings panel is expanded. */
  settingsActive?: boolean
  /** The name of the orbital the camera is focused on. */
  targetName?: string
  /** The translated page text for the app. */
  pageText?: PageText
  /** Store actions. */
  action?: Pick<BoundActions, 'setUIControls' | 'toggleModal' | 'toggleSettings'>
}

/**
 * Connects the heads-up display to the store.
 */
export function UIControlsContainer(props: Props) {
  const { settingsActive, action } = props

  /** Expands the settings panel when it is collapsed, and collapses it when expanded. */
  const toggleSettings = () => {
    action.toggleSettings(!settingsActive)
  }

  /** Opens the modal of the given type, yielding interactivity to it. */
  const openModal = (type: string) => {
    action.toggleModal(type)
    action.setUIControls(false)
  }

  return <UIControls openModal={openModal} toggleSetting={toggleSettings} {...props} {...action} />
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
