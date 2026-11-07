import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import { Constants } from '../constants'

/**
 * Returns true if the keyboard focus is visibly held by one of the UI controls.
 */
const isControlFocused = (): boolean => {
  const focused = document.activeElement

  return !!focused?.closest(`#${Constants.UI.CONTROLS_ID}`) && focused.matches(':focus-visible')
}

/**
 * Restores the UI controls on scene interaction.
 */
export function Idle(): null {
  const interacted = useStore((state) => state.interacted)
  const controlsEnabled = useStore((state) => state.controlsEnabled)
  const isComplete = useStore((state) => state.isComplete)
  const activeModal = useStore((state) => state.activeModal)
  const recordInteraction = useStore((state) => state.recordInteraction)
  const previousInteracted = useRef(interacted)

  /**
   * Restores the scene.
   */
  const idle = () => {
    if (isControlFocused()) {
      // the user is still using the controls just not with the pointer
      return recordInteraction()
    }

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

  useEffect(() => {
    window.addEventListener('keydown', recordInteraction)
    window.addEventListener('focusin', recordInteraction)

    return () => {
      window.removeEventListener('keydown', recordInteraction)
      window.removeEventListener('focusin', recordInteraction)
    }
  }, [recordInteraction])

  return null
}
