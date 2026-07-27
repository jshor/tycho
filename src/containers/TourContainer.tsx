import { useEffect, useRef } from 'react'
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
  /** The narration labels that play over the course of the tour. */
  labels?: TourLabelItem[]
}

/** Supplied by connect. */
interface StateProps {
  /** Whether or not the user may interact with the controls. */
  controlsEnabled?: boolean
  /** The scene's current size scale. */
  scale?: number
  /** The ID of the orbital the camera is focused on. */
  targetId?: string
  /** Whether or not the tour has finished playing. */
  isComplete?: boolean
  /** Whether or not the simulation is currently playing. */
  playing?: boolean
  /** The translated page text for the app. */
  pageText?: PageText
}

export interface Props extends StateProps, OwnProps {
  /** Store actions. */
  action?: Pick<
    BoundActions,
    'setActiveOrbital' | 'setCameraOrbit' | 'setUIControls' | 'tourCompleted'
  >
}

/**
 * Plays the tour the first time the user visits the scene.
 */
export function TourContainer(props: Props) {
  const { playing, labels, action } = props
  const hasInitialized = useRef(false)

  /** Ends the tour and hands the scene back to the user. */
  const skipTour = () => {
    action.tourCompleted(true)
    action.setCameraOrbit(false)
    action.setUIControls(true)
    localStorage.setItem('tourViewed', 'true')
  }

  /** Marks the tour as viewed once its last label has played. */
  const onTourComplete = () => {
    localStorage.setItem('tourViewed', 'true')
    action.tourCompleted(true)
  }

  /** Takes the scene away from the user and orbits it for the length of the tour. */
  const initializeTour = () => {
    const duration = labels.reduce((cur, next) => {
      return cur + next.duration + Constants.Tour.SEPARATION_INTERVAL
    }, Constants.Tour.SEPARATION_INTERVAL)

    setTimeout(() => {
      action.setCameraOrbit(true)
      action.setUIControls(false)
    })

    setTimeout(onTourComplete, duration)
  }

  /** Starts the tour on the user's first visit, and skips it on every visit after. */
  useEffect(() => {
    if (hasInitialized.current || !playing) return

    hasInitialized.current = true

    if (localStorage.getItem('tourViewed') === 'true_TEST') {
      skipTour()
    } else {
      initializeTour()
    }
  }) // eslint-disable-line react-hooks/exhaustive-deps

  /** Builds a label for each item of narration, timed to play one after the other. */
  const getLabels = (labels: TourLabelItem[]) => {
    let totalTime = 0

    return labels.map(({ text, duration }, key) => {
      totalTime += Constants.Tour.SEPARATION_INTERVAL
      const start = totalTime
      totalTime += duration
      const end = totalTime

      return <TourLabelContainer key={key} text={text} start={start} end={end} />
    })
  }

  if (!playing) {
    return null
  }

  return <Tour {...props} skipTour={skipTour} labels={getLabels(labels)} />
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
