import Scale from '../utils/Scale'
import { IOrbital } from './new-store'

/**
 * Raw orbital record as found in `/static/data/orbitals.json`.
 * Identical in shape to {@link IOrbital} except that `satellites` is a nested
 * list of child orbitals rather than a list of ids.
 */
interface RawOrbital extends Omit<IOrbital, 'satellites'> {
  satellites?: RawOrbital[]
}

export interface NormalizedOrbitals {
  /** Flat lookup of every body (planets + satellites) keyed by id */
  orbitals: Record<string, IOrbital>
  /** Ids of the top-level bodies (those that orbit the sun) */
  rootIds: string[]
}

/**
 * Flattens the nested orbital data into a flat record keyed by id and scales
 * astronomical distances down into scene units.
 *
 * Distances in the source data are in kilometres (Earth's semimajor axis is
 * ~1.5e8 km); {@link Scale} divides by `UNIT_SCALE` so orbits land in a sane
 * range for the scene (Earth ~150, Pluto ~5900). `radius` is intentionally left
 * in kilometres so the live planet-size `scale` can be applied per frame.
 *
 * @param {RawOrbital[]} data - parsed contents of orbitals.json
 * @returns {NormalizedOrbitals}
 */
export default function normalizeOrbitals (data: RawOrbital[]): NormalizedOrbitals {
  const orbitals: Record<string, IOrbital> = {}

  const walk = (raw: RawOrbital): string => {
    const satellites = (raw.satellites || []).map(walk)

    orbitals[raw.id] = {
      ...raw,
      semimajor: Scale(raw.semimajor),
      semiminor: Scale(raw.semiminor),
      satellites
    }

    return raw.id
  }

  const rootIds = data.map(walk)

  return { orbitals, rootIds }
}
