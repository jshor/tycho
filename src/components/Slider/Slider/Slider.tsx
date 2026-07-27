import React from 'react'
import ReactSlider from 'react-slider'

interface Props {
  orientation: 'horizontal' | 'vertical'
  step?: number
  min?: number
  max?: number
  value?: number
  onChange?: (value: number) => void
  invert?: boolean
  defaultValue?: number
}

interface State {
  value: number
}

export default class Slider extends React.Component<Props, State> {
  componentDidMount = () => {
    this.setState({
      value: this.getInitialValue()
    })
  }

  getInitialValue = (): number => {
    const { value } = this.props
    return value || 0
  }

  getClassName = (subName?: string): string => {
    const { orientation } = this.props
    let baseName = 'slider'

    if (subName) {
      baseName += `__${subName}`
    }
    return `${baseName} ${baseName}--${orientation}`
  }

  render() {
    return (
      <ReactSlider
        orientation={this.props.orientation}
        className={this.getClassName('container')}
        thumbClassName={this.getClassName('handle')}
        trackClassName={this.getClassName('bar')}
        pearling={true}
        invert={this.props.invert}
        step={this.props.step}
        min={this.props.min}
        max={this.props.max}
        value={this.props.value}
        onChange={this.props.onChange}
      />
    )
  }
}
