import React from 'react'
import Orbital from './Orbital'
import { State, useStore } from '../store/new-store'

const SolarSystem = () => {
  const orbitals = useStore((state: State) => state.orbitals)
  const rootIds = useStore((state: State) => state.rootIds)

  // render only the top-level bodies; each Orbital recurses into its satellites
  const orbitalComponents = rootIds
    .map((id: string) => orbitals[id])
    .filter(Boolean)
    .map((o) => <Orbital orbital={o} key={o.id} />)

  return (
    <group>
      {orbitalComponents}
    </group>
  )
}

export default SolarSystem
