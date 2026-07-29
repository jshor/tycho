import { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { useStore } from '../store'
import { DatePicker as DatePickerView } from '../components/datePicker/datePicker'
import { Constants } from '../constants'

/**
 * Shows the current simulation time, allowing the user pick a new one.
 */
export function DatePicker() {
  const time = useStore((state) => state.time)

  const [uxTime, setUxTime] = useState<string>()
  const [realTime, setRealTime] = useState<Date>()

  const isOpen = useRef(false)

  /**
   * Formats the given time for display using non-breaking spaces.
   */
  const getUXTime = (timeInstance: moment.Moment): string => {
    return timeInstance.format(Constants.UI.UX_DATE_FORMAT).replace(/ /g, '\u00a0')
  }

  /**
   * Shows the given time on the readout.
   */
  const showTime = (timeInstance: moment.Moment): void => {
    setUxTime(getUXTime(timeInstance))
    setRealTime(timeInstance.toDate())
  }

  /**
   * Re-reads the clock whenever it ticks, unless the calendar is open.
   */
  useEffect(() => {
    if (isOpen.current || time === undefined) return

    showTime(moment(time * 1000))
  }, [time]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Shows the clock while the calendar is open.
   */
  const showPicker = () => {
    isOpen.current = true
  }

  /**
   * Releases the clock once the calendar closes.
   */
  const hidePicker = () => {
    isOpen.current = false
  }

  /**
   * Advances (or regresses) the simulation time to the given one.
   */
  const changeTime = (picked: Date) => {
    showTime(moment(picked))
    useStore.setState({ timeOffset: moment(picked).unix() })
  }

  return (
    <DatePickerView
      uxTime={uxTime}
      value={realTime}
      onChange={changeTime}
      onOpen={showPicker}
      onClose={hidePicker}
    />
  )
}
