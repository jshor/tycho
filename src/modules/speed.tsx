import { useStore } from '../store'
import { Speed as SpeedView } from '../components/speed/speed'
import { Constants } from '../constants'

/**
 * Connects the speed control to the store.
 */
export function Speed() {
  const speed = useStore((state) => state.speed) ?? Constants.UI.Speed.MIN

  /**
   * Runs the simulation clock at the power of ten the user picked.
   */
  const changeSpeed = (speed: number) => {
    useStore.setState({ speed })
  }

  return <SpeedView speed={speed} onChange={changeSpeed} />
}
