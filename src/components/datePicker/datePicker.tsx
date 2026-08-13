import React from 'react'
import Calendar from 'react-datepicker'
import { Constants } from '../../constants'
import 'react-datepicker/dist/react-datepicker.css'
import './datePicker.scss'

interface DisplayProps {
  /** The current user-friendly simulation time. */
  uxTime?: string
  /** Click event handler. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Reference to the picker element. */
  ref?: React.Ref<HTMLButtonElement>
}

/**
 * The visual date/time rendered on the scene.
 */
function Display({ uxTime, onClick, ref }: DisplayProps) {
  return (
    <button type="button" className="date-picker__display" onClick={onClick} ref={ref}>
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
  return (
    <div className="date-picker">
      <Calendar
        selected={value}
        onChange={(time: Date | null) => time && onChange?.(time)}
        onCalendarOpen={onOpen}
        onCalendarClose={onClose}
        customInput={<Display uxTime={uxTime} />}
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
