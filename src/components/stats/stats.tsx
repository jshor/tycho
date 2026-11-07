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

      {/* each reading is paired with what it is, so the two are read out together */}
      <dl className="stats__footer">
        <dt>{pageText?.stats?.currentEarthTime}</dt>
        <dd>{time}</dd>
        <dt>{pageText?.stats?.velocityAtVector}</dt>
        <dd>
          {velocity}&nbsp;
          {pageText?.abbreviations?.kilometers}/{pageText?.abbreviations?.seconds}
        </dd>
        <dt>{pageText?.stats?.distanceToSun}</dt>
        <dd>
          {magnitude} {pageText?.abbreviations?.kilometers}
        </dd>
        <dt>{pageText?.stats?.trueAnomaly}</dt>
        <dd>
          {trueAnomaly} {pageText?.abbreviations?.theta}
        </dd>
      </dl>
    </div>
  )
}
