import { useMemo } from 'react'
import { useStore } from '../store'
import { PhysicsService } from '../utils/physics'
import { formatUnixTime } from '../utils/time'
import { Stats as StatsView } from '../components/stats/stats'
import { OrbitalStats } from '../types'

/**
 * Returns a number as it is read out: to three places, and grouped in thousands.
 */
const format = (x: number): string => {
  return x
    .toFixed(3)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Reports the live orbital statistics of the orbital the camera is focused on.
 */
export function Stats() {
  const pageText = useStore((state) => state.pageText)
  const target = useStore((state) => state.target)
  const time = useStore((state) => state.time)

  /**
   * The statistics of the focused orbital, read out anew as the clock ticks.
   */
  const stats = useMemo<OrbitalStats>(() => {
    if (!target || time === undefined) {
      return {
        magnitude: 'N/A',
        velocity: 'N/A',
        trueAnomaly: 'N/A'
      }
    }

    const { eccentricity, periapses, centralMass, semimajor } = target
    const { distance, trueAnomaly } = PhysicsService.getDistanceFromAttractingBody(
      eccentricity,
      time,
      periapses,
      semimajor
    )

    return {
      magnitude: format(distance),
      velocity: format(PhysicsService.orbitalEnergyConservation(centralMass, distance, semimajor)),
      trueAnomaly: format(trueAnomaly)
    }
  }, [target, time])

  return (
    <StatsView
      description={target?.description}
      velocity={stats.velocity}
      magnitude={stats.magnitude}
      trueAnomaly={stats.trueAnomaly}
      pageText={pageText}
      time={time === undefined ? '' : formatUnixTime(time)}
    />
  )
}
