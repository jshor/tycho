import React from 'react'
import Datetime from 'react-datetime'
import moment from 'moment'
import DatePicker from '../components/DatePicker'
import Constants from '../constants'

interface Props {
  time?: number
  onUpdate?: (time: number) => void
}

interface State {
  uxTime?: string
  realTime?: Date
}

export default class DatePickerContainer extends React.Component<Props, State> {
  isOpen: boolean = false
  pickerRef = React.createRef<any>()

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

  changeTime = (timeInstance: moment.Moment) => {
    const time = timeInstance.unix()
    this.props.onUpdate(time)
  }

  render() {
    return (
      <DatePicker onClick={this.showPicker} uxTime={this.state.uxTime}>
        <Datetime
          value={this.state.realTime}
          ref={this.pickerRef}
          className="date-picker__picker"
          onBlur={this.hidePicker}
          onChange={this.changeTime as any}
          closeOnSelect={true}
          inputProps={{
            className: 'date-picker__input'
          }}
        />
      </DatePicker>
    )
  }
}
