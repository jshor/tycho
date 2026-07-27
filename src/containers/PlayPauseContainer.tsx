import React from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import ReduxService from '../services/ReduxService'
import * as AnimationActions from '../actions/AnimationActions'
import PlayPause from '../components/PlayPause'

interface Props {
  playing?: boolean
  action?: Pick<BoundActions, 'setPlaying'>
}

export class PlayPauseContainer extends React.Component<Props> {
  togglePlayer = () => {
    this.props.action.setPlaying(!this.props.playing)
  }

  render() {
    return <PlayPause playing={this.props.playing} onClick={this.togglePlayer} />
  }
}

export default connect(
  ReduxService.mapStateToProps<Props>('animation.playing'),
  ReduxService.mapDispatchToProps<Props['action']>(AnimationActions)
)(PlayPauseContainer)
