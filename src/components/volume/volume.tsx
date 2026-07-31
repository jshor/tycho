import cx from 'classnames'
import { onActivate } from '../../utils/a11y'
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
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onActivate(onClick)}
      className={cx({
        volume: true,
        'volume volume--playing': playing,
        'volume volume--muted': !playing
      })}
    >
      <div className="volume__bar"></div>
      <div className="volume__bar"></div>
      <div className="volume__bar"></div>
      <div className="volume__bar"></div>
    </div>
  )
}
