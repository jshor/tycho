import { useEffect, useState } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import ReduxService from '../services/ReduxService'
import OrbitalService from '../services/OrbitalService'
import Constants from '../constants'
import Stats from '../components/Stats'
import { OrbitalData, PageText } from '../types'

export interface Props {
  /** The ID of the orbital the camera is focused on. */
  targetId?: string
  /** The orbital data for the Solar System. */
  orbitalData?: OrbitalData[]
  /** The translated page text for the app. */
  pageText?: PageText
  /** The current simulation time. */
  time?: number
}

interface Stat {
  /** The name of the orbital the statistics describe. */
  name?: string
  /** The encyclopedic description of the orbital. */
  description?: string
  /** The orbital's distance from the body it orbits. */
  magnitude?: string
  /** The orbital's velocity along its current vector. */
  velocity?: string
  /** The orbital's angle from its periapsis. */
  trueAnomaly?: string
}

/**
 * Reports the live orbital statistics of the orbital the camera is focused on.
 */
export function StatsContainer({ targetId, orbitalData, pageText, time }: Props) {
  const [stats, setStats] = useState<Stat>({})

  /** Recomputes the statistics whenever the target changes or the clock ticks. */
  useEffect(() => {
    const target = OrbitalService.getTargetByName(orbitalData, targetId)

    if (target) {
      const { name, description } = target

      setStats({
        name,
        description,
        ...OrbitalService.getOrbitalStats(target, time)
      })
    }
  }, [targetId, time, orbitalData])

  /** Formats the current simulation time for display. */
  const getTime = (): string => {
    return moment(time * 1000).format(Constants.UI.UX_DATE_FORMAT)
  }

  return (
    <Stats
      description={stats.description}
      velocity={stats.velocity}
      magnitude={stats.magnitude}
      trueAnomaly={stats.trueAnomaly}
      pageText={pageText}
      time={getTime()}
    />
  )
}

export default connect(
  ReduxService.mapStateToProps(
    'label.targetId',
    'data.orbitalData',
    'data.pageText',
    'animation.time'
  ),
  null
)(StatsContainer)
