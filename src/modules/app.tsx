import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { Clock } from '../elements/clock'
// import NoWebGL from '../components/noWebGL/noWebGL';
import { SplashScreen } from '../components/splashScreen/splashScreen'
import { Markdown } from '../components/markdown/markdown'
import { Constants } from '../constants'
import { focusById } from '../utils/a11y'
import { Idle } from './idle'
import { Loader } from './loader'
import { Modal } from './modal'
import { Tour } from './tour'
import { Scene } from './scene'
import { Stats } from './stats'
import { UIControls } from './uiControls'
import { Labels } from './labels'

const TITLE = 'Tycho: Solar System Simulator' // TODO: move to common i18n lib

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
  const isComplete = useStore((state) => state.isComplete)
  const activeModal = useStore((state) => state.activeModal)
  // the clock outlives every render, and is built the once
  const [clock] = useState(() => new Clock())
  const lastTime = useRef(0)
  const previousOffset = useRef(timeOffset)

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

  /**
   * Hands the keyboard focus to the scene once the tour leaves it to the user.
   */
  useEffect(() => {
    if (isComplete) {
      focusById(Constants.UI.SCENE_ID)
    }
  }, [isComplete])

  if (orbitalData && pageText) {
    // if (!webglEnabled) {
    //     return <NoWebGL pageText={pageText} />;
    // }
    return (
      <main className="app">
        <h1 className="sr-only">{TITLE}</h1>
        <div inert={!isComplete || !!activeModal}>
          <Scene onAnimate={onAnimate} />
          <Labels />
          <UIControls />
        </div>
        <Idle />
        <Loader />
        <Tour labels={Constants.Tour.LABELS} />
        <Modal type={Constants.UI.ModalTypes.STATS_MODAL}>
          <Stats />
        </Modal>
        <Modal type={Constants.UI.ModalTypes.ABOUT_MODAL}>
          <Markdown text={pageText.aboutInfo} />
        </Modal>
      </main>
    )
  }
  return (
    <main className="app">
      <h1 className="sr-only">{TITLE}</h1>
      <SplashScreen show />
    </main>
  )
}
