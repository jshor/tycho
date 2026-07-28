import { useEffect } from 'react'
import useStore from '../store'
import VolumeView from '../components/volume'

/**
 * Reads the volume the user last chose, defaulting to audible.
 */
export const getVolume = (): number => {
  const volume = parseInt(localStorage.getItem('volume') || '', 10)

  return isNaN(volume) ? 1 : volume
}

/**
 * Remembers the given volume for a year.
 */
export const setVolume = (volume: number) => {
  localStorage.setItem('volume', String(volume))
}

/**
 * Connects the mute button to the store, honouring the volume the user last chose.
 */
export default function Volume() {
  const volume = useStore((state) => state.volume)

  /**
   * Mutes the scene when the user muted it on a previous visit.
   */
  useEffect(() => {
    if (volume && !getVolume()) {
      useStore.setState({ volume: 0 })
    }
  }, [volume])

  /**
   * Mutes the ambience when it is audible, and unmutes it when it is muted.
   */
  const triggerVolume = () => {
    const volume = getVolume() ? 0 : 1

    setVolume(volume)
    useStore.setState({ volume })
  }

  return <VolumeView onClick={triggerVolume} playing={!!volume} />
}
