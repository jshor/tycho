import React from 'react'
import { A11Y_ACTIVATION_KEYS } from '../constants/UI'

/**
 * Returns an accessibility keyboard event handler.
 */
export function onActivate (onClick?: () => void): React.KeyboardEventHandler {
  return (ev) => {
    if (!onClick || !A11Y_ACTIVATION_KEYS.includes(ev.key)) {
      return
    }

    ev.preventDefault()
    onClick()
  }
}