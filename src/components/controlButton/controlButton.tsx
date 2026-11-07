import cx from 'classnames'
import React from 'react'
import './controlButton.scss'

interface Props {
  /** Accessible label for the button. */
  label: string
  /** Click event handler for the button. */
  onClick: () => void
  /** Children elements to be rendered inside the button. */
  children?: React.ReactNode
  /** Whether or not the button is disabled. */
  disabled?: boolean
  /** Whether or not the button is active. */
  active?: boolean
  /** Whether or not the popover the button opens is open. */
  expanded?: boolean
  /** The ID of the popover the button opens. */
  controls?: string
  /** Button reference. */
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * A round button for UI controls.
 */
export function ControlButton({
  label,
  onClick,
  active,
  disabled,
  expanded,
  controls,
  ref,
  children
}: Props) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx({
        'control-button': true,
        'control-button--active': active,
        'control-button--disabled': disabled
      })}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onClick}
      disabled={disabled}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{label}</span>
    </button>
  )
}
