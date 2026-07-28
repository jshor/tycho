import React from 'react'

interface Props {
  /** Toggles the calendar open and closed. */
  onClick: () => void
  /** The current user-friendly simulation time. */
  uxTime?: string
  /** The calendar rendered beneath the display. */
  children?: React.ReactNode
}

/**
 * The clock readout that opens the scene's date picker.
 */
export function DatePicker({ onClick, uxTime, children }: Props) {
  return (
    <div className="date-picker">
      <span className="date-picker__display" onClick={onClick}>
        {uxTime}
      </span>
      {children}
    </div>
  )
}
