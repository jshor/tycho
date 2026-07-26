import React from 'react'
import Markdown from '../Markdown'
import { PageText } from '../../types'

interface Props {
  description?: string
  velocity?: string
  magnitude?: string
  trueAnomaly?: string
  time?: string
  pageText?: PageText
}

export default class Stats extends React.Component<Props> {
  render() {
    const { pageText } = this.props
    return (
      <div className="stats">
        <Markdown text={this.props.description || ''} />

        <div className="stats__footer">
          <div className="stats__info">
            <span>{pageText && pageText.stats && pageText.stats.currentEarthTime}</span>
            <br />
            <span>{pageText && pageText.stats && pageText.stats.velocityAtVector}</span>
            <br />
            <span>{pageText && pageText.stats && pageText.stats.distanceToSun}</span>
            <br />
            <span>{pageText && pageText.stats && pageText.stats.trueAnomaly}</span>
            <br />
          </div>
          <div className="stats__info">
            <span>{this.props.time}</span>
            <br />
            <span>
              {this.props.velocity}&nbsp;
              {pageText && pageText.abbreviations && pageText.abbreviations.kilometers}/
              {pageText && pageText.abbreviations && pageText.abbreviations.seconds}
            </span>
            <br />
            <span>
              {this.props.magnitude}{' '}
              {pageText && pageText.abbreviations && pageText.abbreviations.kilometers}
            </span>
            <br />
            <span>
              {this.props.trueAnomaly}{' '}
              {pageText && pageText.abbreviations && pageText.abbreviations.theta}
            </span>
          </div>
        </div>
      </div>
    )
  }
}
