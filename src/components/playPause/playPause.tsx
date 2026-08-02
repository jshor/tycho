import './playPause.scss'
import { ControlButton } from '../controlButton/controlButton'

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
    <ControlButton onClick={onClick}>
      {playing ? '❙ ❙' : '▶'}
    </ControlButton>
  )
}
