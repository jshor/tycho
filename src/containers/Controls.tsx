import React from 'react'
import Datetime from 'react-datetime'
import moment from 'moment'
import PlayPause from '../components/PlayPause'
import DatePicker from '../components/DatePicker'
import Slider from '../components/Slider/Slider'
import { Sliders, UX_DATE_FORMAT } from '../constants/UI'
import { State, useStore } from '../store/new-store'
import './Controls.scss'

/**
 * Essential DOM control overlay for the simulator: play/pause, animation speed,
 * the focused body's name, and a date/time picker for time travel. All state is
 * read from / written to the Zustand store.
 */
const Controls = () => {
  const playing = useStore((state: State) => state.playing)
  const setPlaying = useStore((state: State) => state.setPlaying)
  const animationSpeed = useStore((state: State) => state.animationSpeed)
  const setAnimationSpeed = useStore((state: State) => state.setAnimationSpeed)
  const scale = useStore((state: State) => state.scale)
  const setScale = useStore((state: State) => state.setScale)
  const currentTime = useStore((state: State) => state.currentTime)
  const timeTravel = useStore((state: State) => state.timeTravel)
  const focusedOrbitalId = useStore((state: State) => state.focusedOrbitalId)
  const targetName = useStore((state: State) => state.orbitals[focusedOrbitalId]?.name)

  const uxTime = moment(currentTime).format(UX_DATE_FORMAT)

  const changeTime = (value: moment.Moment | string) => {
    const target = moment(value as any).valueOf()

    if (isFinite(target)) {
      // timeTravel tweens by a delta from the current clock time
      timeTravel(target - currentTime)
    }
  }

  return (
    <div className="uicontrols uicontrols--enabled">
      {targetName && (
        <div className="uicontrols__control uicontrols__control--target-label">
          <span>{targetName}</span>
        </div>
      )}

      <div className="uicontrols__control uicontrols__control--datetime">
        <DatePicker uxTime={uxTime} onClick={() => {}}>
          <Datetime
            value={moment(currentTime)}
            className="date-picker__picker"
            onChange={changeTime}
            closeOnSelect={true}
            inputProps={{ className: 'date-picker__input' }}
          />
        </DatePicker>
        <PlayPause playing={playing} onClick={() => setPlaying(!playing)} />
      </div>

      <div className="uicontrols__control uicontrols__control--speed">
        <span className="uicontrols__slider-label">Speed</span>
        <Slider
          orientation="horizontal"
          min={Sliders.Speed.MIN}
          max={Sliders.Speed.MAX}
          step={Sliders.Speed.STEP}
          value={animationSpeed}
          onChange={setAnimationSpeed}
        />
      </div>

      <div className="uicontrols__control uicontrols__control--scale">
        <span className="uicontrols__slider-label">Size</span>
        <Slider
          orientation="horizontal"
          min={Sliders.Scale.MIN}
          max={Sliders.Scale.MAX}
          step={Sliders.Scale.STEP}
          value={scale}
          onChange={setScale}
        />
      </div>
    </div>
  )
}

export default Controls
