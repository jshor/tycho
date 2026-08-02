import { useMemo } from 'react'
import { useStore } from '../store'
import { OrbitalService } from '../services/OrbitalService'
import { formatUnixTime } from '../utils/DateTime'
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

  /**
   * The statistics of the focused orbital, recomputed as the target changes and the clock ticks.
   */
  const stats = useMemo<Stat>(() => {
    const target = OrbitalService.getTargetByName(orbitalData, targetId)

    if (!target) return {}

    const { name, description } = target

    return {
      name,
      description,
      ...OrbitalService.getOrbitalStats(target, time)
    }
  }, [targetId, time, orbitalData])

  /**
   * Formats the current simulation time for display.
   */
  const getTime = (): string => {
    return time === undefined ? '' : formatUnixTime(time)
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
