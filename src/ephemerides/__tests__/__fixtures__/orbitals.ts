import { OrbitalData } from '../../../types'

/**
 * Types a partial orbital as `OrbitalData`
 */
export const orbital = (data: Partial<OrbitalData>) => data as OrbitalData

export const makeFlatOrbitals = (): Record<string, OrbitalData> => ({
  dummy: orbital({
    name: 'Dummy',
    radius: 1000,
    satelliteIds: ['child']
  }),
  child: orbital({
    name: 'Child',
    radius: 10
  })
})

/**
 * The raw JSON text for a single orbital file, as `getJsonData()` reads it.
 */
export const ORBITAL_JSON = JSON.stringify({
  name: 'Saturn',
  radius: 58232,
  ephemeris: {
    nasaOrbitalCode: '6',
    nasaBarycenterCode: '10',
    revolutionOrder: 'y'
  }
})
