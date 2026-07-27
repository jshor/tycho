import { useEffect } from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import Cookies from 'js-cookie'
import VolumeView from '../components/volume'
import * as UIControlsActions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'

export interface Props {
  /** The volume of the scene's ambience [0, 1]. */
  volume?: number
  /** Store actions. */
  action?: Pick<BoundActions, 'setVolume'>
}

/** Reads the volume the user last chose, defaulting to audible. */
export const getVolume = (): number => {
  const volume = parseInt(Cookies.get('volume'), 10)

  return isNaN(volume) ? 1 : volume
}

/** Remembers the given volume for a year. */
export const setVolume = (volume: number) => {
  Cookies.set('volume', String(volume), { expires: 365 })
}

/**
 * Connects the mute button to the store, honouring the volume the user last chose.
 */
export function Volume({ volume, action }: Props) {
  /** Mutes the scene when the user muted it on a previous visit. */
  useEffect(() => {
    if (volume && !getVolume()) {
      action.setVolume(0)
    }
  }, [volume, action])

  /** Mutes the ambience when it is audible, and unmutes it when it is muted. */
  const triggerVolume = () => {
    const volume = getVolume() ? 0 : 1

    setVolume(volume)
    action.setVolume(volume)
  }

  return <VolumeView onClick={triggerVolume} playing={!!volume} />
}

export default connect(
  ReduxService.mapStateToProps<Props>('uiControls.volume'),
  ReduxService.mapDispatchToProps<Props['action']>(UIControlsActions)
)(Volume)
