import { Markdown } from '../markdown/markdown'
import { PageText } from '../../types'
import './stats.scss'

interface Props {
  /** The encyclopedic description of the active orbital. */
  description?: string
  /** The orbital's velocity along its current vector. */
  velocity?: string
  /** The orbital's distance from the body it orbits. */
  magnitude?: string
  /** The orbital's angle from its periapsis. */
  trueAnomaly?: string
  /** The current simulation time, formatted for display. */
  time?: string
  /** The translated page text for the app. */
  pageText?: PageText
}

/**
 * The readout of the active orbital's description and live orbital statistics.
 */
export function Stats({ description, velocity, magnitude, trueAnomaly, time, pageText }: Props) {
  return (
    <div className="stats">
      <div className="stats__description">
        <Markdown text={description || ''} />
      </div>

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
          <span>{time}</span>
          <br />
          <span>
            {velocity}&nbsp;
            {pageText && pageText.abbreviations && pageText.abbreviations.kilometers}/
            {pageText && pageText.abbreviations && pageText.abbreviations.seconds}
          </span>
          <br />
          <span>
            {magnitude} {pageText && pageText.abbreviations && pageText.abbreviations.kilometers}
          </span>
          <br />
          <span>
            {trueAnomaly} {pageText && pageText.abbreviations && pageText.abbreviations.theta}
          </span>
        </div>
      </div>
    </div>
  )
}
