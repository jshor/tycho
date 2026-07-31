import React, { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Ellipse } from '../utils/Ellipse'
import { OrbitalService as Service } from '../services/OrbitalService'
import { Orbital as OrbitalView } from '../components/orbital/orbital'
import { Texture } from './texture'
import { OrbitalData, TextureMap } from '../types'
import { DoubleSide, Euler } from 'three'
import { Constants } from '../constants'
import { Scale, getVisibleRadius } from '../utils/Scale'
import { MathService } from '../services/MathService'

export interface Props extends OrbitalData {
  /** The ID of the orbital this one orbits, if it is a satellite. */
  parentId?: string
  /** The satellites orbiting this orbital. */
  children?: React.ReactNode
}

/**
 * Positions an orbital along its orbit, and keeps it there as the simulation runs.
 */
export function Orbital(props: Props) {
  const { id, parentId, isSatellite } = props

  // the orbit is traced the once, out of the orbital data the body arrived with
  const [ellipse] = useState(() => new Ellipse(props))
  const time = useStore((state) => state.time)
  const targetId = useStore((state) => state.targetId)
  const orbitalData = useStore((state) => state.orbitalData)
  const highlightedOrbitals = useStore((state) => state.highlightedOrbitals)

  /** Sets the currently-focused orbital. */
  const setActiveOrbital = useStore((state) => state.setActiveOrbital)

  /** Adds the given orbital to the list of highlighted ones. */
  const addHighlightedOrbital = useStore((state) => state.addHighlightedOrbital)

  /** Removes the given orbital from the list of highlighted ones. */
  const removeHighlightedOrbital = useStore((state) => state.removeHighlightedOrbital)

  /** Store actions. */
  const action = useMemo(
    () => ({ setActiveOrbital, addHighlightedOrbital, removeHighlightedOrbital }),
    [setActiveOrbital, addHighlightedOrbital, removeHighlightedOrbital]
  )

  // the orbit is only ever tilted once, out of the orbital data it was built from
  const eclipticGroupRotation = useMemo(() => Service.getEclipticGroupRotation(props), []) // eslint-disable-line react-hooks/exhaustive-deps
  const orbitalGroupRotation = useMemo(() => Service.getOrbitalGroupRotation(props), []) // eslint-disable-line react-hooks/exhaustive-deps

  /** Where the body sits along its orbit, and how it is turned, at the current time. */
  const body = useMemo(
    () => ({
      rotation: Service.getBodyRotation({ ...props, time }),
      position: Service.getBodyPosition({ ...props, time }, ellipse),
      percent: Service.getBodyPercent({ ...props, time }, ellipse),
      maxDistance: Service.getMaxViewDistance(props)
    }),
    [time, ellipse] // eslint-disable-line react-hooks/exhaustive-deps
  )

  /** How prominently the orbit path is drawn, given what the user is pointing at. */
  const pathOpacity = useMemo(
    () => Service.getPathOpacity(props, highlightedOrbitals, id === targetId),
    [highlightedOrbitals, id, targetId] // eslint-disable-line react-hooks/exhaustive-deps
  )

  /** The system the camera is watching, every orbital of which shows its label. */
  const systemId = useMemo(
    () => Service.getSystemId(orbitalData ?? [], targetId),
    [orbitalData, targetId]
  )

  return (
    <OrbitalView
      eclipticGroupRotation={eclipticGroupRotation}
      orbitalGroupRotation={orbitalGroupRotation}
      pathVertices={ellipse.getVertices()}
      bodyPosition={body.position}
      bodyPercent={body.percent}
      pathOpacity={pathOpacity}
      atmosphere={props.atmosphere}
      maxDistance={body.maxDistance}
      tail={props.tail}
      text={props.name}
      radius={props.radius}
      action={action}
      systemId={systemId}
      isFocused={id === targetId}
      parentId={parentId}
      isSatellite={isSatellite}
      id={id}
    >
      <group>
        {/* the orbital body */}
        <mesh rotation={body.rotation}>
          <sphereGeometry
            args={[
              Scale(getVisibleRadius(props.radius)),
              Constants.WebGL.SPHERE_SEGMENTS,
              Constants.WebGL.SPHERE_SEGMENTS
            ]}
          />
          <Texture textures={props.maps} />
        </mesh>

        {/* planetary rings (if any) */}
        {props.rings && <Rings {...props.rings} />}
      </group>
      {props.children}
    </OrbitalView>
  )
}

/**
 * The flat, textured plane standing in for a body's ring system.
 */
export function Rings({
  outerRadius,
  maps,
  barycenterTilt
}: {
  /** The distance from the body's centre to the outer edge of the rings, in km. */
  outerRadius: number
  /** The texture maps applied to the rings' material. */
  maps: TextureMap[]
  /** The axial tilt of the body the rings encircle, in degrees. */
  barycenterTilt: number
}) {
  const tilt = MathService.toRadians(barycenterTilt)
  const size = Scale(outerRadius * 2)
  const rotation = new Euler(tilt, 0, 0)

  return (
    <mesh rotation={rotation}>
      <planeGeometry args={[size, size]} />
      <Texture transparent={true} side={DoubleSide} textures={maps} />
    </mesh>
  )
}
