import Actions from '../constants/Actions'
import { ReduxAction } from '../types'

export const setActiveOrbital = (
  targetId: string,
  targetName: string,
  animateTargetChange = true
): ReduxAction => ({
  type: Actions.SET_ACTIVE_ORBITAL,
  targetId,
  targetName,
  animateTargetChange
})

export const setLabelText = (labelText: string): ReduxAction => ({
  type: Actions.SET_LABEL_TEXT,
  labelText
})

export const addHighlightedOrbital = (highlightedOrbital: string): ReduxAction => ({
  type: Actions.ADD_HIGHLIGHTED_ORBITAL,
  highlightedOrbital
})

export const removeHighlightedOrbital = (highlightedOrbital: string): ReduxAction => ({
  type: Actions.REMOVE_HIGHLIGHTED_ORBITAL,
  highlightedOrbital
})
