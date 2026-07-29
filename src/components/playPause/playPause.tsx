import cx from 'classnames'
import './playPause.scss'

interface Props {
  /** Toggles playback of the simulation. */
  onClick: () => void
  /** Whether the simulation is currently playing. */
  playing?: boolean
}

/**
 * The button that plays and pauses the simulation.
 */
export function PlayPause({ onClick, playing }: Props) {
  return (
    <div className="play-pause" onClick={onClick}>
      <span
        className={cx({
          'play-pause__button': true,
          'play-pause__button--playing': playing,
          'play-pause__button--paused': !playing
        })}
      />
    </div>
  )
}
