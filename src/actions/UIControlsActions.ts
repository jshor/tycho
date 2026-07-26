import Actions from '../constants/Actions'
import { ReduxAction } from '../types'

export const changeZoom = (zoom: number): ReduxAction => ({
  type: Actions.ZOOM_CHANGE,
  zoom
})

export const changeSpeed = (speed: number): ReduxAction => ({
  type: Actions.SPEED_CHANGE,
  speed
})

export const changeScale = (scale: number): ReduxAction => ({
  type: Actions.SCALE_CHANGE,
  scale
})

export const changeTimeOffset = (timeOffset: number): ReduxAction => ({
  type: Actions.TIME_OFFSET_CHANGE,
  timeOffset
})

export const setUIControls = (controlsEnabled: boolean): ReduxAction => ({
  type: Actions.SET_UI_CONTROLS,
  controlsEnabled
})

export const toggleModal = (activeModal: string | null): ReduxAction => ({
  type: Actions.MODAL_ACTIVE,
  activeModal
})

export const toggleSettings = (settingsActive: boolean): ReduxAction => ({
  type: Actions.SETTINGS_ACTIVE,
  settingsActive
})

export const setVolume = (volume: number): ReduxAction => ({
  type: Actions.SET_VOLUME,
  volume
})
