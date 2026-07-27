import React from 'react'
import OrbitalContainer from '../../containers/OrbitalContainer'
import Sun from '../Sun'
import { OrbitalData, OrbitalLabelActions } from '../../types'

interface Props {
  /** The orbital data for the Solar System. */
  orbitalData: OrbitalData[]
  /** The current simulation time. */
  time?: number
  /** The scene's current size scale. */
  scale?: number
  /** Store actions passed down to each orbital's label. */
  action?: OrbitalLabelActions
  /** The ids of the orbitals whose paths are highlighted. */
  highlightedOrbitals?: string[]
  /** The id of the orbital the camera is focused on. */
  targetId?: string
  /** Anything rendered into the scene alongside the orbitals. */
  children?: React.ReactNode
}

/**
 * Every orbital in the Solar System, orbiting the Sun.
 */
export default function Scene({
  orbitalData,
  time,
  scale,
  action,
  highlightedOrbitals,
  targetId
}: Props) {
  /** Recursively renders the given orbitals, nesting each one's satellites within it. */
  const getOrbitalElements = (
    orbitals: OrbitalData[],
    isSatellite?: boolean,
    parentId?: string
  ) => {
    return orbitals.map((orbital) => (
      <OrbitalContainer
        {...orbital}
        key={orbital.id}
        action={action}
        scale={scale}
        time={time}
        targetId={targetId}
        highlightedOrbitals={highlightedOrbitals}
        isSatellite={isSatellite}
        parentId={parentId}
      >
        {orbital.satellites && getOrbitalElements(orbital.satellites, !isSatellite, orbital.id)}
      </OrbitalContainer>
    ))
  }

  return (
    <group>
      {getOrbitalElements(orbitalData)}
      <Sun />
    </group>
  )
}
