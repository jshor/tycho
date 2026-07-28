import useStore from '../store'
import PlayPauseView from '../components/playPause'

/**
 * Connects the play/pause button to the store.
 */
export default function PlayPause() {
  const playing = useStore((state) => state.playing)

  /**
   * Starts the simulation when it is paused, and pauses it when it is playing.
   */
  const togglePlayer = () => {
    useStore.setState({ playing: !playing })
  }

  return <PlayPauseView playing={playing} onClick={togglePlayer} />
}
