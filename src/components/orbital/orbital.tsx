import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import Body from './body'
import Label from './label'
import Atmosphere from './atmosphere'
import Constants from '../../constants'
import { TextureMap, RingData, OrbitalLabelActions } from '../../types'

export interface Props {
  eclipticGroupRotation: THREE.Euler
  orbitalGroupRotation: THREE.Euler
  pathVertices: THREE.Vector3[]
  bodyPosition: THREE.Vector3
  bodyRotation: THREE.Euler
  bodyPercent?: number
  radius: number
  id: string
  text: string
  action: OrbitalLabelActions
  atmosphere?: number
  pathOpacity?: number
  maps?: TextureMap[]
  targetId?: string
  parentId?: string
  isSatellite?: boolean
  maxDistance?: number
  rings?: RingData
  children?: React.ReactNode
}

export default function Orbital(props: Props) {
  const {
    eclipticGroupRotation,
    orbitalGroupRotation,
    pathVertices,
    bodyPosition,
    bodyRotation,
    bodyPercent,
    atmosphere,
    pathOpacity,
    id,
    radius,
    rings,
    maps,
    children
  } = props

  const lineColor = useMemo(() => new THREE.Color(atmosphere ?? 0xffffff), [atmosphere])

  const pathColors = useMemo(() => {
    // fades the orbit path into a trail
    const { r, g, b } = lineColor
    const total = pathVertices.length
    const colors: [number, number, number, number][] = new Array(total)

    for (let i = 0; i < total; i++) {
      // fraction of an orbit this vertex sits ahead of the body in the direction of travel
      const ahead = (((i / (total - 1) - (bodyPercent ?? 0) + 1) % 1) + 1) % 1

      colors[i] = [r, g, b, ahead]
    }
    return colors
  }, [pathVertices.length, bodyPercent, lineColor])

  // Only bodies listed as having an atmosphere scatter light; see Constants.WebGL.Atmospheres.
  const scattering = Constants.WebGL.Atmospheres[id]

  return (
    <group rotation={eclipticGroupRotation}>
      <group rotation={orbitalGroupRotation}>
        <group position={bodyPosition} name={id}>
          <Body rotation={bodyRotation} radius={radius} rings={rings} maps={maps} />
          {scattering && (
            <Atmosphere radius={radius} color={atmosphere ?? 0xffffff} settings={scattering} />
          )}
          <Label
            text={props.text}
            id={id}
            action={props.action}
            targetId={props.targetId}
            parentId={props.parentId}
            isSatellite={props.isSatellite}
            maxDistance={props.maxDistance}
          />
          {children}
        </group>

        <Line
          key={`path-${id}`}
          points={pathVertices}
          color="#ffffff"
          vertexColors={pathColors}
          opacity={pathOpacity ?? 1}
          transparent
        />
      </group>
    </group>
  )
}
