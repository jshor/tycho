import React from 'react'
import Slider from '../Slider'

interface Props {
  label?: string
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
}

export default class ScaleSlider extends React.Component<Props> {
  render() {
    return (
      <div>
        <div className="slider slider--horizontal">
          <span className="slider__label">
            {this.props.label}
            {this.props.value || this.props.min}
          </span>
          <Slider
            orientation="horizontal"
            value={this.props.value}
            onChange={this.props.onChange}
            defaultValue={this.props.min}
            min={this.props.min}
            max={this.props.max}
          />
        </div>
      </div>
    )
  }
}
