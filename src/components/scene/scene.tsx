import React from 'react'
import { Orbital } from '../../modules/orbital'
import { Sun } from '../sun/sun'
import { OrbitalData } from '../../types'

interface Props {
  /** The orbital data for the Solar System. */
  orbitalData: OrbitalData[]
  /** Anything rendered into the scene alongside the orbitals. */
  children?: React.ReactNode
}

/**
 * Every orbital in the Solar System, orbiting the Sun.
 */
export function Scene({ orbitalData }: Props) {
  /**
   * Recursively renders the given orbitals, nesting each one's satellites within it.
   */
  const getOrbitalElements = (
    orbitals: OrbitalData[],
    isSatellite?: boolean,
    parentId?: string
  ) => {
    return orbitals.map((orbital) => (
      <Orbital {...orbital} key={orbital.id} isSatellite={isSatellite} parentId={parentId}>
        {orbital.satellites && getOrbitalElements(orbital.satellites, !isSatellite, orbital.id)}
      </Orbital>
    ))
  }

  return (
    <group>
      {getOrbitalElements(orbitalData)}
      <Sun />
    </group>
  )
}
