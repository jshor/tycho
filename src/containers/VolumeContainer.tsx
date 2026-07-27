import React from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import Cookies from 'js-cookie'
import Volume from '../components/Volume'
import * as UIControlsActions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'

interface Props {
  volume?: number
  action?: Pick<BoundActions, 'setVolume'>
}

export class VolumeContainer extends React.Component<Props> {
  componentDidUpdate = (prevProps: Props) => {
    if (this.props.volume && prevProps.volume !== this.props.volume && !this.getVolume()) {
      this.props.action.setVolume(0)
    }
  }

  setVolume = (volume: number) => {
    Cookies.set('volume', String(volume), { expires: 365 })
  }

  getVolume = (): number => {
    const volume = parseInt(Cookies.get('volume'), 10)
    return isNaN(volume) ? 1 : volume
  }

  triggerVolume = () => {
    const volume = this.getVolume() ? 0 : 1

    this.setVolume(volume)
    this.props.action.setVolume(volume)
  }

  render() {
    return <Volume onClick={this.triggerVolume} playing={!!this.props.volume} />
  }
}

export default connect(
  ReduxService.mapStateToProps<Props>('uiControls.volume'),
  ReduxService.mapDispatchToProps<Props['action']>(UIControlsActions)
)(VolumeContainer)
