import { useEffect, useRef, useState } from 'react'
import Datetime from 'react-datetime'
import moment from 'moment'
import useStore from '../store'
import DatePickerView from '../components/datePicker'
import Constants from '../constants'

type DatetimePicker = Datetime & {
  openCalendar: () => void
}

/**
 * Shows the current simulation time, allowing the user pick a new one.
 */
export default function DatePicker() {
  const time = useStore((state) => state.time)

  const [uxTime, setUxTime] = useState<string>()
  const [realTime, setRealTime] = useState<Date>()

  const isOpen = useRef(false)
  const pickerRef = useRef<DatetimePicker>(null)

  /**
   * Formats the given time for display using non-breaking spaces.
   */
  const getUXTime = (timeInstance: moment.Moment): string => {
    return timeInstance.format(Constants.UI.UX_DATE_FORMAT).replace(/ /g, ' ')
  }

  /**
   * Re-reads the clock whenever it ticks, unless the calendar is open.
   */
  useEffect(() => {
    if (isOpen.current || time === undefined) return

    const timeInstance = moment(time * 1000)

    setUxTime(getUXTime(timeInstance))
    setRealTime(timeInstance.toDate())
  }, [time])

  /**
   * Releases the clock once the calendar closes.
   */
  const hidePicker = () => {
    isOpen.current = false
  }

  /**
   * Opens the calendar.
   */
  const showPicker = () => {
    const picker = pickerRef.current

    if (picker) {
      isOpen.current = true
      picker.openCalendar()
    }
  }

  /**
   * Advances (or regresses) the simulation time to the given one.
   */
  const changeTime = (value: moment.Moment | string) => {
    // react-datetime emits the raw input string while a partially typed date is still
    // unparseable, and only hands back a Moment once it resolves.
    if (typeof value === 'string') return

    useStore.setState({ timeOffset: value.unix() })
  }

  return (
    <DatePickerView onClick={showPicker} uxTime={uxTime}>
      <Datetime
        value={realTime}
        ref={pickerRef}
        className="date-picker__picker"
        onClose={hidePicker}
        onChange={changeTime}
        closeOnSelect={true}
        inputProps={{
          className: 'date-picker__input'
        }}
      />
    </DatePickerView>
  )
}
