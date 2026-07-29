import { useStore } from '../store'
import { PlayPause as PlayPauseView } from '../components/playPause/playPause'

/**
 * Connects the play/pause button to the store.
 */
export function PlayPause() {
  const playing = useStore((state) => state.playing)

  /**
   * Starts the simulation when it is paused, and pauses it when it is playing.
   */
  const togglePlayer = () => {
    useStore.setState({ playing: !playing })
  }

  return <PlayPauseView playing={playing} onClick={togglePlayer} />
}
