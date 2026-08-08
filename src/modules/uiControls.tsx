import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { DatePicker } from '../components/datePicker/datePicker'
import { UIControlsLayout } from '../components/uiControlsLayout/uiControlsLayout'
import { ControlButton } from '../components/controlButton/controlButton'
import { Volume } from '../components/volume/volume'
import { ZoomSlider } from '../components/slider/zoomSlider/zoomSlider'
import { PlayPause } from '../components/playPause/playPause'
import { SpeedControl } from '../components/speedControl/speedControl'
import { Constants } from '../constants'
import { OrbitalSymbol } from '../components/orbitalSymbol/orbitalSymbol'
import { formatDateTime, getUnixTime } from '../utils/DateTime'

/**
 * Connects the heads-up display to the store.
 */
export function UIControls() {
  const zoom = useStore((state) => state.zoom)
  const controlsEnabled = useStore((state) => state.controlsEnabled)
  const targetName = useStore((state) => state.targetName)
  // the sign is the one thing about the target that has to be looked up in the data
  const targetSymbol = useStore((state) => state.target?.symbol)
  const changeZoom = useStore((state) => state.changeZoom)
  const playing = useStore((state) => state.playing)
  const volume = useStore((state) => state.volume)
  const speed = useStore((state) => state.speed) ?? Constants.UI.Speed.MIN

  /**
   * Runs the simulation clock at the power of ten the user picked.
   */
  const changeSpeed = (speed: number) => {
    useStore.setState({ speed })
  }

  /**
   * Starts the simulation when it is paused, and pauses it when it is playing.
   */
  const togglePlayer = () => {
    useStore.setState({ playing: !playing })
  }

  /**
   * Opens the modal of the given type, yielding interactivity to it.
   */
  const openModal = (activeModal: string) => {
    useStore.setState({ activeModal, controlsEnabled: false })
  }

  /**
   * Reads the volume the user last chose, defaulting to audible.
   */
  const getVolume = (): number => {
    const volume = parseInt(localStorage.getItem('volume') || '', 10)

    return isNaN(volume) ? 1 : volume
  }

  /**
   * Remembers the given volume for a year.
   */
  const setVolume = (volume: number) => {
    localStorage.setItem('volume', String(volume))
  }

  /**
   * Mutes the ambience when it is audible, and unmutes it when it is muted.
   */
  const triggerVolume = () => {
    const volume = getVolume() ? 0 : 1

    setVolume(volume)
    useStore.setState({ volume })
  }

  const time = useStore((state) => state.time)

  const [uxTime, setUxTime] = useState<string>()
  const [realTime, setRealTime] = useState<Date>()

  const isOpen = useRef(false)

  /**
   * Formats the given time for display using non-breaking spaces.
   */
  const getUXTime = (date: Date): string => {
    return formatDateTime(date).replace(/ /g, '\u00a0')
  }

  /**
   * Shows the given time on the readout.
   */
  const showTime = (date: Date): void => {
    setUxTime(getUXTime(date))
    setRealTime(date)
  }

  /**
   * Shows the clock while the calendar is open.
   */
  const showPicker = () => {
    isOpen.current = true
  }

  /**
   * Releases the clock once the calendar closes.
   */
  const hidePicker = () => {
    isOpen.current = false
  }

  /**
   * Advances (or regresses) the simulation time to the given one.
   */
  const changeTime = (picked: Date) => {
    showTime(picked)
    useStore.setState({ timeOffset: getUnixTime(picked) })
  }

  /**
   * Mutes the scene when the user muted it on a previous visit.
   */
  useEffect(() => {
    if (volume && !getVolume()) {
      useStore.setState({ volume: 0 })
    }
  }, [volume])

  /**
   * Re-reads the clock whenever it ticks, unless the calendar is open.
   */
  useEffect(() => {
    if (isOpen.current || time === undefined) return

    showTime(new Date(time * 1000))
  }, [time]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <UIControlsLayout
      controlsEnabled={controlsEnabled}
      label={
        <>
          <OrbitalSymbol symbol={targetSymbol} />
          {targetName}
        </>
      }
      onLabelClick={() => openModal(Constants.UI.ModalTypes.STATS_MODAL)}
      left={
        <>
          <ControlButton onClick={() => openModal(Constants.UI.ModalTypes.ABOUT_MODAL)}>
            <span style={{ fontSize: '1.25rem' }}>i</span>
          </ControlButton>
          <ZoomSlider value={zoom} onChange={changeZoom} />
          <Volume onClick={triggerVolume} playing={!!volume} />
        </>
      }
      right={
        <>
          <PlayPause playing={playing} onClick={togglePlayer} />
          <SpeedControl speed={speed} onChange={changeSpeed} />
        </>
      }
      bottom={
        <DatePicker
          uxTime={uxTime}
          value={realTime}
          onChange={changeTime}
          onOpen={showPicker}
          onClose={hidePicker}
        />
      }
    />
  )
}
