import { useEffect, useRef } from 'react'
import useStore from '../store'
import SpinLabelView from '../components/spinLabel'
import Constants from '../constants'

/**
 * Prompts the user to spin the camera.
 */
export default function SpinLabel() {
  const isComplete = useStore((state) => state.isComplete)
  const isAutoOrbitEnabled = useStore((state) => state.isAutoOrbitEnabled)
  const touched = useStore((state) => state.touched)

  const previousTouched = useRef(touched)

  /**
   * Whether or not the prompt is visible.
   */
  const isVisible = (): boolean => isComplete && isAutoOrbitEnabled

  /**
   * Hands the camera to the user the first time they reach for the scene.
   */
  useEffect(() => {
    if (previousTouched.current === touched) return

    previousTouched.current = touched

    if (isVisible()) {
      useStore.setState({ isAutoOrbitEnabled: false, controlsEnabled: true })
    }
  }) // eslint-disable-line react-hooks/exhaustive-deps

  return <SpinLabelView show={isVisible()} count={Constants.UI.SPIN_LABEL_ARROW_COUNT} />
}
