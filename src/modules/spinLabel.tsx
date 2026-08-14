import { useStore } from '../store'
import { SpinLabel as SpinLabelView } from '../components/spinLabel/spinLabel'
import { Constants } from '../constants'

/**
 * Prompts the user to spin the camera.
 */
export function SpinLabel() {
  const isComplete = useStore((state) => state.isComplete)
  const isAutoOrbitEnabled = useStore((state) => state.isAutoOrbitEnabled)
  const isIdle = useStore((state) => state.isIdle)

  /**
   * Whether or not the prompt is visible.
   */
  const isVisible = (): boolean => isComplete && isAutoOrbitEnabled && !isIdle

  return <SpinLabelView show={isVisible()} count={Constants.UI.SPIN_LABEL_ARROW_COUNT} />
}
