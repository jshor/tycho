import React from 'react'
import * as THREE from 'three'
import Ellipse from '../utils/Ellipse'
import Service from '../services/OrbitalService'
import Orbital from '../components/Orbital'
import { OrbitalData, OrbitalLabelActions } from '../types'

interface Props extends OrbitalData {
  targetId?: string
  parentId?: string
  time?: number
  scale?: number
  active?: boolean
  highlightedOrbitals?: string[]
  action?: OrbitalLabelActions
  children?: React.ReactNode
}

interface State {
  eclipticGroupRotation?: THREE.Euler
  orbitalGroupRotation?: THREE.Euler
  bodyRotation?: THREE.Euler
  bodyPosition?: THREE.Vector3
  bodyPercent?: number
  pathOpacity?: number
  maxDistance?: number
  scaleLastUpdate?: number
}

export class OrbitalContainer extends React.Component<Props, State> {
  ellipse: Ellipse

  constructor(props: Props) {
    super(props)
    this.ellipse = new Ellipse(props)
    this.state = {
      eclipticGroupRotation: Service.getEclipticGroupRotation(props),
      orbitalGroupRotation: Service.getOrbitalGroupRotation(props),
      pathOpacity: Service.getPathOpacity(props, undefined, props.id === props.targetId),
      bodyRotation: Service.getBodyRotation(props),
      bodyPosition: Service.getBodyPosition(props, this.ellipse),
      bodyPercent: Service.getBodyPercent(props, this.ellipse),
      maxDistance: Service.getMaxViewDistance(props)
    }
  }

  componentDidUpdate = (prevProps: Props) => {
    this.maybeUpdateBodyState(prevProps)
    this.maybeUpdatePathOpacity(prevProps)
    this.maybeUpdateScale(prevProps)
  }

  maybeUpdateBodyState = (prevProps: Props) => {
    if (prevProps.time !== this.props.time) {
      this.setBodyState(this.props, this.ellipse)
    }
  }

  maybeUpdatePathOpacity = (prevProps: Props) => {
    if (prevProps.highlightedOrbitals !== this.props.highlightedOrbitals) {
      this.setPathOpacity(this.props, this.props.highlightedOrbitals)
    }
  }

  maybeUpdateScale = (prevProps: Props) => {
    if (prevProps.scale !== this.props.scale) {
      if (this.props.isSatellite) {
        this.ellipse.setScale(this.props.scale)
      }
      this.setBodyState(this.props, this.ellipse)
      this.setState({ scaleLastUpdate: this.props.time })
    }
  }

  setPathOpacity = (props: Props, highlightedOrbitals?: string[]) => {
    this.setState({
      pathOpacity: Service.getPathOpacity(props, highlightedOrbitals, this.isTarget())
    })
  }

  setGroupRotations = (props: Props) => {
    this.setState({
      eclipticGroupRotation: Service.getEclipticGroupRotation(props),
      orbitalGroupRotation: Service.getOrbitalGroupRotation(props)
    })
  }

  setBodyState = (props: Props, ellipse: Ellipse) => {
    this.setState({
      bodyRotation: Service.getBodyRotation(props),
      bodyPosition: Service.getBodyPosition(props, ellipse),
      bodyPercent: Service.getBodyPercent(props, ellipse),
      maxDistance: Service.getMaxViewDistance(props)
    })
  }

  isTarget = (): boolean => {
    return this.props.id === this.props.targetId
  }

  render() {
    return (
      <Orbital
        eclipticGroupRotation={this.state.eclipticGroupRotation}
        orbitalGroupRotation={this.state.orbitalGroupRotation}
        pathVertices={this.ellipse.getVertices()}
        bodyPosition={this.state.bodyPosition}
        bodyPercent={this.state.bodyPercent}
        bodyRotation={this.state.bodyRotation}
        pathOpacity={this.state.pathOpacity}
        atmosphere={this.props.atmosphere}
        scaleLastUpdate={this.state.scaleLastUpdate}
        maxDistance={this.state.maxDistance}
        maps={this.props.maps}
        rings={this.props.rings}
        text={this.props.name}
        radius={this.props.radius}
        action={this.props.action}
        targetId={this.props.targetId}
        parentId={this.props.parentId}
        isSatellite={this.props.isSatellite}
        scale={this.props.scale}
        id={this.props.id}
      >
        {this.props.children}
      </Orbital>
    )
  }
}

export default OrbitalContainer
