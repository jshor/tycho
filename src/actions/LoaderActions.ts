import Actions from '../constants/Actions'
import { ReduxAction } from '../types'

export const setPercentLoaded = (count: number, total: number): ReduxAction => {
  const percent = (count / total) * 100
  return {
    type: Actions.SET_PERCENT_LOADED,
    percent
  }
}

export const setTextureLoaded = (url: string): ReduxAction => ({
  type: Actions.SET_TEXTURE_LOADED,
  url
})
