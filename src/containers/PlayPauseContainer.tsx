import { BoundActions } from '../types'
import { connect } from 'react-redux'
import ReduxService from '../services/ReduxService'
import * as AnimationActions from '../actions/AnimationActions'
import PlayPause from '../components/PlayPause'

export interface Props {
  /** Whether or not the simulation is currently playing. */
  playing?: boolean
  /** Store actions. */
  action?: Pick<BoundActions, 'setPlaying'>
}

/**
 * Connects the play/pause button to the store.
 */
export function PlayPauseContainer({ playing, action }: Props) {
  /** Starts the simulation when it is paused, and pauses it when it is playing. */
  const togglePlayer = () => {
    action.setPlaying(!playing)
  }

  return <PlayPause playing={playing} onClick={togglePlayer} />
}

export default connect(
  ReduxService.mapStateToProps<Props>('animation.playing'),
  ReduxService.mapDispatchToProps<Props['action']>(AnimationActions)
)(PlayPauseContainer)
