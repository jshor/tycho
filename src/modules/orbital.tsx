import React, { useMemo, useRef } from 'react'
import { useStore } from '../store'
import { Ellipse } from '../utils/Ellipse'
import { OrbitalService as Service } from '../services/OrbitalService'
import { Orbital as OrbitalView } from '../components/orbital'
import { OrbitalData } from '../types'

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
  const time = useStore((state) => state.time)
  const targetId = useStore((state) => state.targetId)
  const orbitalData = useStore((state) => state.orbitalData)
  const highlightedOrbitals = useStore((state) => state.highlightedOrbitals)
  const setActiveOrbital = useStore((state) => state.setActiveOrbital)
  const addHighlightedOrbital = useStore((state) => state.addHighlightedOrbital)
  const removeHighlightedOrbital = useStore((state) => state.removeHighlightedOrbital)
  const action = useMemo(
    () => ({ setActiveOrbital, addHighlightedOrbital, removeHighlightedOrbital }),
    [setActiveOrbital, addHighlightedOrbital, removeHighlightedOrbital]
  )
  const ellipseRef = useRef<Ellipse>(null)

  if (!ellipseRef.current) {
    ellipseRef.current = new Ellipse(props)
  }

  const ellipse = ellipseRef.current

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
      bodyRotation={body.rotation}
      pathOpacity={pathOpacity}
      atmosphere={props.atmosphere}
      maxDistance={body.maxDistance}
      maps={props.maps}
      rings={props.rings}
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
      {props.children}
    </OrbitalView>
  )
}
