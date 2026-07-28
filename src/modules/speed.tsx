import { useStore } from '../store'
import { Speed as SpeedView } from '../components/speed'
import { Constants } from '../constants'

/**
 * Connects the speed button to the store.
 */
export function Speed() {
  const speed = useStore((state) => state.speed) ?? Constants.UI.Speed.MIN

  /**
   * Steps up to the next speed, starting over once the fastest one has played.
   */
  const nextSpeed = () => {
    const { MIN, MAX } = Constants.UI.Speed

    useStore.setState({ speed: speed >= MAX ? MIN : speed + 1 })
  }

  return <SpeedView speed={speed} onClick={nextSpeed} />
}
