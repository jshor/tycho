import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { Constants } from '../constants'

/**
 * Restores the UI controls on scene interaction.
 */
export function Idle(): null {
  const interacted = useStore((state) => state.interacted)
  const controlsEnabled = useStore((state) => state.controlsEnabled)
  const isComplete = useStore((state) => state.isComplete)
  const activeModal = useStore((state) => state.activeModal)
  const previousInteracted = useRef(interacted)

  /**
   * Restores the scene.
   */
  const idle = () => {
    useStore.setState({ isIdle: true, isAutoOrbitEnabled: true, controlsEnabled: false })
  }

  /**
   * Idles the controls and commences auto-orbiting.
   */
  const interact = () => {
    useStore.setState({ isIdle: false, isAutoOrbitEnabled: false, controlsEnabled: true })
  }

  /**
   * Restores the scene on interaction.
   */
  useEffect(() => {
    if (previousInteracted.current === interacted) return

    previousInteracted.current = interacted

    if (isComplete && !activeModal) {
      interact()
    }
  })

  /**
   * Records the last interaction time with the scene.
   */
  useEffect(() => {
    if (!controlsEnabled || activeModal) return

    const timeout = setTimeout(idle, Constants.UI.IDLE_INTERVAL)

    return () => clearTimeout(timeout)
  }, [interacted, controlsEnabled, activeModal])

  return null
}
