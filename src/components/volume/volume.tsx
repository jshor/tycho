import cx from 'classnames'
import './volume.scss'

interface Props {
  /** Whether the ambience is currently audible. */
  playing?: boolean
  /** Toggles the ambience between muted and audible. */
  onClick?: () => void
}

/**
 * The button that mutes and unmutes the scene's ambience.
 */
export function Volume({ playing, onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="Sound"
      aria-pressed={!!playing}
      onClick={onClick}
      className={cx({
        volume: true,
        'volume volume--playing': playing,
        'volume volume--muted': !playing
      })}
    >
      <span className="volume__bar" aria-hidden="true"></span>
      <span className="volume__bar" aria-hidden="true"></span>
      <span className="volume__bar" aria-hidden="true"></span>
      <span className="volume__bar" aria-hidden="true"></span>
    </button>
  )
}
