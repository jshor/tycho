import React, { useMemo } from 'react'
import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { Label } from './label/label'
import { Atmosphere } from './atmosphere/atmosphere'
import { Comet } from './comet/comet'
import { TailData, OrbitalLabelActions } from '../../types'
import { Ellipse } from '../../utils/Ellipse'

export interface Props {
  eclipticGroupRotation: THREE.Euler
  orbitalGroupRotation: THREE.Euler
  /** The orbital path's `Ellipse` instance. */
  ellipse: Ellipse
  /** The radius of the orbital body. */
  radius: number
  /** The ID of the orbital body. */
  id: string
  /** The ID of the parent orbital body (if this is a satellite). */
  parentId?: string
  /** Whether this orbital body is a satellite. */
  isSatellite?: boolean
  /** The text to display on the orbital label. */
  text: string
  action: OrbitalLabelActions // TODO: don't pass actions like this!
  /** How far the body's atmosphere reaches above its surface, in km. */
  atmosphereHeightKm?: number
  /** The color that atmosphere scatters the sunlight into. */
  atmosphereColor?: string
  /** The color of the label and its visual orbital path ellipse. */
  labelColor?: number
  /** The percentage of opacity for the orbital path ellipse. */
  pathOpacity?: number
  /** The orbital at the centre of the system the camera is watching. */
  systemId?: string
  /** Whether or not the camera is focused on this orbital itself. */
  isFocused?: boolean
  /** The maximum distance at which the camera can be zoomed out to. */
  maxDistance?: number
  /** Orbital tail settings (i.e., for comets). */
  tail?: TailData
  /** Any children elements to render within the barycenter. */
  children?: React.ReactNode
}

/**
 * A component to render a single orbital body, its orbit path, and any associated features like an atmosphere or a tail.
 */
export function Orbital(props: Props) {
  const {
    eclipticGroupRotation,
    orbitalGroupRotation,
    ellipse,
    atmosphereHeightKm,
    atmosphereColor,
    pathOpacity,
    id,
    radius,
    tail,
    children
  } = props

  const hasAtmosphere = !!atmosphereHeightKm && !!atmosphereColor

  return (
    <group rotation={eclipticGroupRotation}>
      <group rotation={orbitalGroupRotation}>
        <group position={ellipse.getPosition()} name={id}>
          {hasAtmosphere && (
            <Atmosphere
              radius={radius}
              height={atmosphereHeightKm as number}
              color={atmosphereColor as string}
            />
          )}
          {tail && (
            <Comet
              radius={radius}
              settings={tail}
              pathVertices={ellipse.pathVertices}
              bodyPercent={ellipse.getVertexPercent()}
            />
          )}
          <Label
            text={props.text}
            id={id}
            color={ellipse.color}
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
          points={ellipse.trailVertices}
          color={props.labelColor}
          vertexColors={ellipse.getTrailingPathColors()}
          opacity={pathOpacity ?? 1}
          transparent
          depthWrite={false}
        />
      </group>
    </group>
  )
}
