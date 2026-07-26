import React from 'react'
import OrbitalContainer from '../../containers/OrbitalContainer'
import Sun from '../Sun'
import { OrbitalData } from '../../types'

interface Props {
  orbitalData: OrbitalData[]
  time?: number
  camera?: any
  scale?: number
  action?: Record<string, any>
  highlightedOrbitals?: string[]
  targetId?: string
  cameraMatrix?: any
  children?: React.ReactNode
}

export default class Scene extends React.Component<Props> {
  getOrbitalElements = (orbitals: OrbitalData[], isSatellite?: boolean, parentId?: string) => {
    return orbitals.map((orbital) => (
      <OrbitalContainer
        {...orbital}
        key={orbital.id}
        action={this.props.action}
        scale={this.props.scale}
        time={this.props.time}
        camera={this.props.camera}
        targetId={this.props.targetId}
        highlightedOrbitals={this.props.highlightedOrbitals}
        isSatellite={isSatellite}
        parentId={parentId}
      >
        {orbital.satellites &&
          this.getOrbitalElements(orbital.satellites, !isSatellite, orbital.id)}
      </OrbitalContainer>
    ))
  }

  render() {
    return (
      <group>
        {this.getOrbitalElements(this.props.orbitalData)}
        <Sun />
      </group>
    )
  }
}
