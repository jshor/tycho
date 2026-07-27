import React, { useMemo, useRef } from 'react'
import Ellipse from '../utils/Ellipse'
import Service from '../services/OrbitalService'
import OrbitalView from '../components/orbital'
import { OrbitalData, OrbitalLabelActions } from '../types'

export interface Props extends OrbitalData {
  /** The ID of the orbital the camera is focused on. */
  targetId?: string
  /** The ID of the orbital this one orbits, if it is a satellite. */
  parentId?: string
  /** The current simulation time. */
  time?: number
  /** The scene's current size scale. */
  scale?: number
  /** Whether this orbital is the active one. */
  active?: boolean
  /** The IDs of the orbitals whose paths are highlighted. */
  highlightedOrbitals?: string[]
  /** Store actions passed down to the orbital's label. */
  action?: OrbitalLabelActions
  /** The satellites orbiting this orbital. */
  children?: React.ReactNode
}

/**
 * Positions an orbital along its orbit, and keeps it there as the simulation runs.
 */
export function Orbital(props: Props) {
  const { id, targetId, parentId, time, scale, highlightedOrbitals, isSatellite, action } = props

  // the ellipse is mutated in place as the scale changes, so it outlives any one render
  const ellipseRef = useRef<Ellipse>()

  if (!ellipseRef.current) {
    ellipseRef.current = new Ellipse(props)
  }

  const ellipse = ellipseRef.current

  // the orbit is only ever tilted once, out of the orbital data it was built from
  const eclipticGroupRotation = useMemo(() => Service.getEclipticGroupRotation(props), []) // eslint-disable-line react-hooks/exhaustive-deps
  const orbitalGroupRotation = useMemo(() => Service.getOrbitalGroupRotation(props), []) // eslint-disable-line react-hooks/exhaustive-deps

  // a satellite's orbit is drawn at the scene's scale, so its path has to be rebuilt to match
  useMemo(() => {
    if (isSatellite) {
      ellipse.setScale(scale)
    }
  }, [scale, isSatellite, ellipse])

  const scaleLastUpdate = useMemo(() => time, [scale]) // eslint-disable-line react-hooks/exhaustive-deps

  /** Where the body sits along its orbit, and how it is turned, at the current time. */
  const body = useMemo(
    () => ({
      rotation: Service.getBodyRotation(props),
      position: Service.getBodyPosition(props, ellipse),
      percent: Service.getBodyPercent(props, ellipse),
      maxDistance: Service.getMaxViewDistance(props)
    }),
    [time, scale, ellipse] // eslint-disable-line react-hooks/exhaustive-deps
  )

  /** How prominently the orbit path is drawn, given what the user is pointing at. */
  const pathOpacity = useMemo(
    () => Service.getPathOpacity(props, highlightedOrbitals, id === targetId),
    [highlightedOrbitals, id, targetId] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <OrbitalView
      eclipticGroupRotation={eclipticGroupRotation}
      orbitalGroupRotation={orbitalGroupRotation}
      pathVertices={ellipse.getVertices()}
      bodyPosition={body.position}
      bodyPercent={body.percent}
      bodyRotation={body.rotation}
      pathOpacity={pathOpacity}
      atmosphere={props.atmosphere}
      scaleLastUpdate={scaleLastUpdate}
      maxDistance={body.maxDistance}
      maps={props.maps}
      rings={props.rings}
      text={props.name}
      radius={props.radius}
      action={action}
      targetId={targetId}
      parentId={parentId}
      isSatellite={isSatellite}
      scale={scale}
      id={id}
    >
      {props.children}
    </OrbitalView>
  )
}

export default Orbital
