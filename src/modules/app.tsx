import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { Clock } from '../utils/Clock'
// import NoWebGL from '../components/noWebGL/noWebGL';
import { SplashScreen } from '../components/splashScreen/splashScreen'
import { Markdown } from '../components/markdown/markdown'
import { Constants } from '../constants'
import { Loader } from './loader'
import { Modal } from './modal'
import { Tour } from './tour'
import { Scene } from './scene'
import { Stats } from './stats'
import { UIControls } from './uiControls'

/**
 * Drives the simulation clock, holding the app behind a splash screen until its data arrives.
 */
export function App() {
  const speed = useStore((state) => state.speed)
  const timeOffset = useStore((state) => state.timeOffset)
  const orbitalData = useStore((state) => state.orbitalData)
  const pageText = useStore((state) => state.pageText)
  const playing = useStore((state) => state.playing)
  const requestOrbitalData = useStore((state) => state.requestOrbitalData)
  const requestPageText = useStore((state) => state.requestPageText)
  const clockRef = useRef<Clock>(null)
  const lastTime = useRef(0)
  const previousOffset = useRef(timeOffset)

  if (!clockRef.current) {
    clockRef.current = new Clock()
  }

  const clock = clockRef.current

  /**
   * Returns true if the clock has moved on since the last store update.
   */
  const shouldUpdateTime = (): boolean => {
    if (clock.getTime() !== lastTime.current) {
      return !!playing
    }
    return false
  }

  /**
   * Updates the store with the clock's current time.
   */
  const updateClock = (force?: boolean) => {
    if (force || shouldUpdateTime()) {
      lastTime.current = clock.getTime()
      useStore.setState({ time: lastTime.current })
    }
  }

  /**
   * Restarts the clock once the simulation resumes.
   */
  const continueClock = () => {
    if (playing && clock.stopped) {
      clock.continue()
    }
  }

  /**
   * Halts the clock once the simulation pauses.
   */
  const stopClock = () => {
    if (!playing && !clock.stopped) {
      clock.stop()
    }
  }

  /**
   * Advances the simulation by one frame.
   */
  const onAnimate = () => {
    updateClock()
    continueClock()
    stopClock()

    clock.speed(speed)
    clock.update()
  }

  /**
   * Fetches the data the app needs, and starts the clock.
   */
  useEffect(() => {
    requestOrbitalData()
    requestPageText()
    updateClock(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Moves the running clock to the time the user picked.
   */
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
    return (
      <>
        <Scene onAnimate={onAnimate} width={window.innerWidth} height={window.innerHeight} />
        <UIControls />
        <Loader />
        <Tour labels={Constants.Tour.LABELS} />
        <Modal type={Constants.UI.ModalTypes.STATS_MODAL}>
          <Stats />
        </Modal>
        <Modal type={Constants.UI.ModalTypes.ABOUT_MODAL}>
          <Markdown text={pageText.aboutInfo} />
        </Modal>
      </>
    )
  }
  return <SplashScreen />
}
