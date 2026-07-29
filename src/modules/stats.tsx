import { useEffect, useState } from 'react'
import moment from 'moment'
import { useStore } from '../store'
import { OrbitalService } from '../services/OrbitalService'
import { Constants } from '../constants'
import { Stats as StatsView } from '../components/stats/stats'

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
export function Stats() {
  const targetId = useStore((state) => state.targetId)
  const orbitalData = useStore((state) => state.orbitalData)
  const pageText = useStore((state) => state.pageText)
  const time = useStore((state) => state.time)

  const [stats, setStats] = useState<Stat>({})

  /**
   * Recomputes the statistics whenever the target changes or the clock ticks.
   */
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

  /**
   * Formats the current simulation time for display.
   */
  const getTime = (): string => {
    return moment(time * 1000).format(Constants.UI.UX_DATE_FORMAT)
  }

  return (
    <StatsView
      description={stats.description}
      velocity={stats.velocity}
      magnitude={stats.magnitude}
      trueAnomaly={stats.trueAnomaly}
      pageText={pageText}
      time={getTime()}
    />
  )
}
