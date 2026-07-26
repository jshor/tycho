import React from 'react'

interface Props {
  modifier?: string
  text?: string
}

export default class TourLabel extends React.Component<Props> {
  render() {
    return (
      <div className="tour-label">
        <span
          className={`
                    tour-label__text
                    tour-label__text--${this.props.modifier}`}
        >
          {this.props.text}
        </span>
      </div>
    )
  }
}
