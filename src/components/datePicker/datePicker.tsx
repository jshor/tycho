import React, { useEffect, useId, useState } from 'react'
import Calendar from 'react-datepicker'
import { Constants } from '../../constants'
import 'react-datepicker/dist/react-datepicker.css'
import './datePicker.scss'

interface DisplayProps {
  /** The current user-friendly simulation time. */
  uxTime?: string
  /** Click event handler. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Key event handler. */
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
  /** The ID of the element describing it. */
  describedBy?: string
  /** Reference to the picker element. */
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * The visual date/time rendered on the scene.
 */
function Display({ uxTime, onClick, onKeyDown, describedBy, ref }: DisplayProps) {
  return (
    <button
      type="button"
      className="date-picker__display"
      aria-haspopup="dialog"
      aria-describedby={describedBy}
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={ref}
    >
      {uxTime}
    </button>
  )
}

interface Props {
  /** The current user-friendly simulation time. */
  uxTime?: string
  /** The time the calendar opens on. */
  value?: Date
  /** Invoked with the time the user picked. */
  onChange?: (time: Date) => void
  /** Invoked once the calendar opens. */
  onOpen?: () => void
  /** Invoked once the calendar closes. */
  onClose?: () => void
}

/**
 * The clock readout that opens the scene's calendar.
 */
export function DatePicker({ uxTime, value, onChange, onOpen, onClose }: Props) {
  const descriptionId = useId()
  const [isOpen, setIsOpen] = useState(false)

  /**
   * Stores that the calendar opened.
   */
  const onCalendarOpen = () => {
    setIsOpen(true)
    onOpen?.()
  }

  /**
   * Stores that the calendar closed.
   */
  const onCalendarClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  /** Provides an ARIA name to the calendar year in the dropdown. */
  useEffect(() => {
    if (!isOpen) return

    document
      .querySelector('.date-picker__calendar .react-datepicker__year-select')
      ?.setAttribute('aria-label', 'Year')
  }, [isOpen])

  return (
    <div className="date-picker">
      <span id={descriptionId} className="sr-only">
        Change the date and time
      </span>
      <Calendar
        selected={value}
        onChange={(time: Date | null) => time && onChange?.(time)}
        onCalendarOpen={onCalendarOpen}
        onCalendarClose={onCalendarClose}
        customInput={<Display uxTime={uxTime} describedBy={descriptionId} />}
        popperClassName="date-picker__calendar"
        timeIntervals={Constants.UI.PICKER_TIME_INTERVAL}
        timeCaption="Time"
        // the year is picked from the dropdown, so the heading is left to name the month alone
        dateFormatCalendar="LLLL"
        dropdownMode="select"
        showYearDropdown
        showTimeSelect
      />
    </div>
  )
}
