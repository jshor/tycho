import React from 'react'
import { DefaultLoadingManager } from 'three'
import { connect } from 'react-redux'
import * as AnimationActions from '../actions/AnimationActions'
import * as LoaderActions from '../actions/LoaderActions'
import * as UIControlsActions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'
import SplashScreen from '../components/SplashScreen'
import { PageText } from '../types'

interface Props {
  url?: string
  percent?: number
  playing?: boolean
  pageText?: PageText
  action?: Record<string, any>
}

interface State {
  hasEntered: boolean
}

export class LoaderContainer extends React.Component<Props, State> {
  state: State = { hasEntered: false }

  componentDidMount = () => {
    ;(DefaultLoadingManager as any).onProgress = this.onProgress
  }

  onProgress = (url: string, count: number, total: number) => {
    this.props.action.setPercentLoaded(count, total)
    this.props.action.setTextureLoaded(url)
  }

  enterScene = () => {
    this.props.action.setPlaying(true)
    this.props.action.setVolume(1)
    this.setState({ hasEntered: true })
  }

  render() {
    return (
      <SplashScreen
        percent={this.props.percent || 0}
        show={!this.state.hasEntered}
        enterScene={this.enterScene}
        pageText={this.props.pageText}
      />
    )
  }
}

export default connect(
  ReduxService.mapStateToProps(
    'loader.url',
    'loader.percent',
    'animation.playing',
    'data.pageText'
  ),
  ReduxService.mapDispatchToProps(AnimationActions, LoaderActions, UIControlsActions)
)(LoaderContainer as React.ComponentType<any>) as any
