import React from 'react'
import { connect } from 'react-redux'
import * as UIControlsActions from '../actions/UIControlsActions'
import * as TourActions from '../actions/TourActions'
import * as LabelActions from '../actions/LabelActions'
import ReduxService from '../services/ReduxService'
import TourLabelContainer from './TourLabelContainer'
import Tour from '../components/Tour'
import Constants from '../constants'
import { TourLabelItem, PageText, BoundActions } from '../types'

/** Passed in by whoever renders the container. */
interface OwnProps {
  labels?: TourLabelItem[]
}

/** Supplied by connect. */
interface StateProps {
  controlsEnabled?: boolean
  scale?: number
  targetId?: string
  isComplete?: boolean
  playing?: boolean
  pageText?: PageText
}

interface Props extends StateProps, OwnProps {
  action?: Pick<
    BoundActions,
    'setActiveOrbital' | 'setCameraOrbit' | 'setUIControls' | 'tourCompleted'
  >
}

export class TourContainer extends React.Component<Props> {
  hasInitialized = false

  initialize = () => {
    if (this.hasInitialized) return
    if (localStorage.getItem('tourViewed') === 'true_TEST') {
      this.skipTour()
    } else if (this.props.playing) {
      this.initializeTour()
    }
    this.hasInitialized = true
  }

  initializeTour = () => {
    const { action, labels } = this.props
    const duration = labels.reduce((cur, next) => {
      return cur + next.duration + Constants.Tour.SEPARATION_INTERVAL
    }, Constants.Tour.SEPARATION_INTERVAL)

    setTimeout(() => {
      action.setCameraOrbit(true)
      action.setUIControls(false)
    })

    setTimeout(this.onTourComplete, duration)
  }

  onTourComplete = () => {
    localStorage.setItem('tourViewed', 'true')
    this.props.action.tourCompleted(true)
  }

  skipTour = () => {
    const { action } = this.props

    action.tourCompleted(true)
    action.setCameraOrbit(false)
    action.setUIControls(true)
    localStorage.setItem('tourViewed', 'true')
  }

  getLabels = (labels: TourLabelItem[]) => {
    let totalTime = 0

    return labels.map(({ text, duration }, key) => {
      totalTime += Constants.Tour.SEPARATION_INTERVAL
      const start = totalTime
      totalTime += duration
      const end = totalTime

      return <TourLabelContainer key={key} text={text} start={start} end={end} />
    })
  }

  render() {
    if (!this.props.playing) {
      return null
    }

    this.initialize()

    return (
      <Tour
        {...this.props}
        skipTour={this.skipTour}
        labels={this.getLabels(this.props.labels)}
      />
    )
  }
}

export default connect(
  ReduxService.mapStateToProps<StateProps>(
    'uiControls.controlsEnabled',
    'uiControls.scale',
    'label.targetId',
    'tour.isComplete',
    'animation.playing',
    'data.pageText'
  ),
  ReduxService.mapDispatchToProps<Props['action']>(UIControlsActions, TourActions, LabelActions)
)(TourContainer)
