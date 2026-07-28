import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { Body } from './body'
import { Label } from './label'
import { Atmosphere } from './atmosphere'
import { Comet } from './comet'
import { Constants } from '../../constants'
import { TextureMap, RingData, TailData, OrbitalLabelActions } from '../../types'

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
  /** The orbital at the centre of the system the camera is watching. */
  systemId?: string
  /** Whether or not the camera is focused on this orbital itself. */
  isFocused?: boolean
  parentId?: string
  isSatellite?: boolean
  maxDistance?: number
  rings?: RingData
  /** Orbital tail settings (i.e., for comets). */
  tail?: TailData
  children?: React.ReactNode
}

/**
 * A component to render a single orbital body, its orbit path, and any associated features like an atmosphere or a tail.
 */
export function Orbital(props: Props) {
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
    tail,
    maps,
    children
  } = props

  /** The color this body wears throughout the scene: its atmosphere, its orbit path, and its label. */
  const bodyColor = atmosphere ?? 0xffffff

  /** The basic (100% opacity) color of the orbit path. */
  const lineColor = useMemo(() => new THREE.Color(bodyColor), [bodyColor])

  /** The fading gradient colors along the path of the ellipse */
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

  const scattering = Constants.WebGL.Atmospheres[id]

  return (
    <group rotation={eclipticGroupRotation}>
      <group rotation={orbitalGroupRotation}>
        <group position={bodyPosition} name={id}>
          <Body rotation={bodyRotation} radius={radius} rings={rings} maps={maps} />
          {scattering && <Atmosphere radius={radius} color={bodyColor} settings={scattering} />}
          {tail && (
            <Comet
              radius={radius}
              settings={tail}
              pathVertices={pathVertices}
              bodyPercent={bodyPercent}
            />
          )}
          <Label
            text={props.text}
            id={id}
            color={bodyColor}
            radius={radius}
            action={props.action}
            systemId={props.systemId}
            isFocused={props.isFocused}
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
          depthWrite={false}
        />
      </group>
    </group>
  )
}
