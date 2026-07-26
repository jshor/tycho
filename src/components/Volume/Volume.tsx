import React from 'react'
import cx from 'classnames'

interface Props {
  playing?: boolean
  onClick?: () => void
}

export default class Volume extends React.Component<Props> {
  render() {
    return (
      <div
        onClick={this.props.onClick}
        className={cx({
          volume: true,
          'volume volume--playing': this.props.playing,
          'volume volume--muted': !this.props.playing
        })}
      >
        <div className="volume__bar"></div>
        <div className="volume__bar"></div>
        <div className="volume__bar"></div>
        <div className="volume__bar"></div>
      </div>
    )
  }
}
