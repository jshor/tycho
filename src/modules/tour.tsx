import { useEffect, useRef } from 'react'
import useStore from '../store'
import TourLabel from './tourLabel'
import TourView from '../components/tour'
import Constants from '../constants'
import { TourLabelItem } from '../types'

interface Props {
  /** The narration labels that play over the course of the tour. */
  labels?: TourLabelItem[]
}

/**
 * Plays the tour the first time the user visits the scene.
 */
export default function Tour({ labels }: Props) {
  const playing = useStore((state) => state.playing)
  const isComplete = useStore((state) => state.isComplete)
  const pageText = useStore((state) => state.pageText)

  const hasInitialized = useRef(false)

  /**
   * Ends the tour and hands the scene back to the user.
   */
  const skipTour = () => {
    useStore.setState({ isComplete: true, isAutoOrbitEnabled: false, controlsEnabled: true })
    localStorage.setItem('tourViewed', 'true')
  }

  /**
   * Marks the tour as viewed once its last label has played.
   */
  const onTourComplete = () => {
    localStorage.setItem('tourViewed', 'true')
    useStore.setState({ isComplete: true })
  }

  /**
   * Takes the scene away from the user and orbits it for the length of the tour.
   */
  const initializeTour = () => {
    const duration = labels.reduce((cur, next) => {
      return cur + next.duration + Constants.Tour.SEPARATION_INTERVAL
    }, Constants.Tour.SEPARATION_INTERVAL)

    setTimeout(() => {
      useStore.setState({ isAutoOrbitEnabled: true, controlsEnabled: false })
    })

    setTimeout(onTourComplete, duration)
  }

  /**
   * Starts the tour on the user's first visit, and skips it on every visit after.
   */
  useEffect(() => {
    if (hasInitialized.current || !playing) return

    hasInitialized.current = true

    if (localStorage.getItem('tourViewed') === 'true_TEST') {
      skipTour()
    } else {
      initializeTour()
    }
  }) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Builds a label for each item of narration, timed to play one after the other.
   */
  const getLabels = (labels: TourLabelItem[]) => {
    let totalTime = 0

    return labels.map(({ text, duration }, key) => {
      totalTime += Constants.Tour.SEPARATION_INTERVAL
      const start = totalTime
      totalTime += duration
      const end = totalTime

      return <TourLabel key={key} text={text} start={start} end={end} />
    })
  }

  if (!playing) {
    return null
  }

  return (
    <TourView
      isComplete={isComplete}
      pageText={pageText}
      skipTour={skipTour}
      labels={getLabels(labels)}
    />
  )
}
