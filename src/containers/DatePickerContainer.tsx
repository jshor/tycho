import React from 'react'
import Datetime from 'react-datetime'
import moment from 'moment'
import DatePicker from '../components/DatePicker'
import Constants from '../constants'

interface Props {
  time?: number
  onUpdate?: (time: number) => void
}

type DatetimePicker = Datetime & {
  openCalendar: () => void
}

interface State {
  uxTime?: string
  realTime?: Date
}

export default class DatePickerContainer extends React.Component<Props, State> {
  isOpen: boolean = false
  pickerRef = React.createRef<DatetimePicker>()

  state: State = {}

  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.time === this.props.time) return
    const { time } = this.props
    const timeInstance = moment(time * 1000)
    const realTime = timeInstance.toDate()
    const uxTime = this.getUXTime(timeInstance)

    if (!this.isOpen) {
      this.setState({ uxTime, realTime })
    }
  }

  shouldComponentUpdate = (): boolean => !this.isOpen

  getUXTime = (timeInstance: moment.Moment): string => {
    return timeInstance.format(Constants.UI.UX_DATE_FORMAT).replace(/ /g, ' ')
  }

  hidePicker = () => {
    this.isOpen = false
  }

  showPicker = () => {
    const picker = this.pickerRef.current

    if (picker) {
      this.isOpen = true
      picker.openCalendar()
    }
  }

  changeTime = (value: moment.Moment | string) => {
    // react-datetime emits the raw input string while a partially typed date is still
    // unparseable, and only hands back a Moment once it resolves.
    if (typeof value === 'string') return

    this.props.onUpdate(value.unix())
  }

  render() {
    return (
      <DatePicker onClick={this.showPicker} uxTime={this.state.uxTime}>
        <Datetime
          value={this.state.realTime}
          ref={this.pickerRef}
          className="date-picker__picker"
          onClose={this.hidePicker}
          onChange={this.changeTime}
          closeOnSelect={true}
          inputProps={{
            className: 'date-picker__input'
          }}
        />
      </DatePicker>
    )
  }
}
