import React from 'react'
import cx from 'classnames'

interface Props {
  onClick: () => void
  playing?: boolean
}

export default class PlayPause extends React.Component<Props> {
  render() {
    return (
      <div className="play-pause" onClick={this.props.onClick}>
        <span
          className={cx({
            'play-pause__button': true,
            'play-pause__button--playing': this.props.playing,
            'play-pause__button--paused': !this.props.playing
          })}
        />
      </div>
    )
  }
}
