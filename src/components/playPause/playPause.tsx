import cx from 'classnames'
import { onActivate } from '../../utils/a11y'
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
    <div
      className="play-pause"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onActivate(onClick)}
    >
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
