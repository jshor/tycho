import { useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import Clock from '../utils/Clock'
import ReduxService from '../services/ReduxService'
import App from '../components/App'
// import NoWebGL from '../components/NoWebGL';
import SplashScreen from '../components/SplashScreen'
import * as DataActions from '../actions/DataActions'
import * as AnimationActions from '../actions/AnimationActions'
import { OrbitalData, PageText, BoundActions } from '../types'

export interface Props {
  /** The speed of the animation. */
  speed?: number
  /** The scale of the animation. */
  scale?: number
  /** The time at which the scene began. */
  timeOffset?: number
  /** The orbital data for the Solar System. */
  orbitalData?: OrbitalData[]
  /** The translated page text for the app. */
  pageText?: PageText
  /** The active orbital target name. */
  targetName?: string
  /** Whether or not the animation is currently playing. */
  playing?: boolean
  /** Store actions. */
  action?: Pick<BoundActions, 'requestOrbitalData' | 'requestPageText' | 'setTime'>
}

/**
 * Drives the simulation clock, holding the app behind a splash screen until its data arrives.
 */
export function AppContainer({
  speed,
  timeOffset,
  orbitalData,
  pageText,
  targetName,
  playing,
  action
}: Props) {
  const clockRef = useRef<Clock>()
  const lastTime = useRef(0)
  const previousOffset = useRef(timeOffset)

  if (!clockRef.current) {
    clockRef.current = new Clock()
  }

  const clock = clockRef.current

  /** Returns true if the clock has moved on since the last store update. */
  const shouldUpdateTime = (): boolean => {
    if (clock.getTime() !== lastTime.current) {
      return !!playing
    }
    return false
  }

  /** Updates the store with the clock's current time. */
  const updateClock = (force?: boolean) => {
    if (force || shouldUpdateTime()) {
      lastTime.current = clock.getTime()
      action.setTime(lastTime.current)
    }
  }

  /** Restarts the clock once the simulation resumes. */
  const continueClock = () => {
    if (playing && clock.stopped) {
      clock.continue()
    }
  }

  /** Halts the clock once the simulation pauses. */
  const stopClock = () => {
    if (!playing && !clock.stopped) {
      clock.stop()
    }
  }

  /** Advances the simulation by one frame. */
  const onAnimate = () => {
    updateClock()
    continueClock()
    stopClock()

    clock.speed(speed)
    clock.update()
  }

  /** Fetches the data the app needs, and starts the clock. */
  useEffect(() => {
    action.requestOrbitalData()
    action.requestPageText()
    updateClock(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /** Moves the running clock to the time the user picked. */
  useEffect(() => {
    if (previousOffset.current === timeOffset) return

    previousOffset.current = timeOffset

    if (playing) {
      clock.setOffset(timeOffset)
    }
  }, [timeOffset, playing, clock])

  if (orbitalData && pageText) {
    // if (!webglEnabled) {
    //     return <NoWebGL pageText={pageText} />;
    // }
    return <App onAnimate={onAnimate} title={targetName} pageText={pageText} />
  }
  return <SplashScreen />
}

export default connect(
  ReduxService.mapStateToProps<Props>(
    'uiControls.speed',
    'uiControls.scale',
    'uiControls.timeOffset',
    'data.orbitalData',
    'data.pageText',
    'label.targetName',
    'animation.playing'
  ),
  ReduxService.mapDispatchToProps<Props['action']>(DataActions, AnimationActions)
)(AppContainer)
