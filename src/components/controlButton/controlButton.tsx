import cx from 'classnames'
import React from 'react'
import { onActivate } from '../../utils/a11y'
import './controlButton.scss'

interface Props {
  /** Click event handler for the button. */
  onClick: () => void
  /** Children elements to be rendered inside the button. */
  children?: React.ReactNode
  /** Whether or not the button is disabled. */
  disabled?: boolean
  /** Whether or not the button is active. */
  active?: boolean
}

/**
 * A round button for UI controls.
 */
export function ControlButton({ onClick, active, disabled, children }: Props) {
  return (
    <button
      className={cx({
        'control-button': true,
        'control-button--active': active,
        'control-button--disabled': disabled
      })}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={() => onActivate(onClick)}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
