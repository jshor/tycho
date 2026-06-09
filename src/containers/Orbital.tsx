import React, { createRef, useMemo, useState } from 'react'
import { Object3D, Group, Vector3, EllipseCurve, Path } from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import Ellipse from '../Ellipse'
import Scale from '../utils/Scale'
import { TRANSITION_TIME } from '../constants'
import { Camera } from '../constants/WebGL'
import { getFocus, getEclipticRotation, getOrbitalRotation } from '../math/geometry'
import { ellipticPercent } from '../math/physics'
import { State, IOrbital, useStore, IPositionCoordinates } from '../store/new-store'

type OrbitalProps = {
  orbital: IOrbital
  /** True when this body orbits another body (a moon) rather than the sun. Moons
   *  scale their orbit with the size multiplier so they grow with their planet;
   *  sun-centric orbits stay fixed at their true JSON distance. */
  isSatellite?: boolean
  /** Ids of the bodies in this moon's system (its parent planet + that planet's
   *  moons). The moon's label only shows when one of these is focused. */
  focusGroupIds?: string[]
}

/** Scratch vector for the camera's world position (it's parented to the dolly
 *  group, so `camera.position` is local — we need its world coords for distance). */
const cameraWorldPosition = new Vector3()

const getPosition = (percentComplete: number, path: Path, group: Group | null): Vector3 => {
  const { x, y } = path.getPoint(percentComplete)

  return new Vector3(x, y, 0)
}

const getWorldPosition = (object: Object3D | null = null, local: Vector3): IPositionCoordinates => {
  if (object) {
    return {
      local: local,
      world: object.localToWorld(local.clone())
    }
  }

  return {
    local,
    world: local
  }
}

/**
 * Creates a new elliptical path for the given semimajor/semiminor axes.
 *
 * @param {number} x - semimajor
 * @param {number} y - semiminor
 * @returns {Path}
 */
const createEllipticalPath = (x: number, y: number) => {
  const focus = getFocus(x, y)
  const end = 2 * Math.PI
  const e = new EllipseCurve(0, focus, x, y, 0, end, false, 0)

  return new Path(e.getPoints(50))
}


const Orbital = (props: OrbitalProps) => {
  const group = createRef<Group>()
  const orbital = createRef<Group>()
  const {
    id, name, eccentricity, radius, semimajor, semiminor, periapses,
    inclination, longitudeOfAscendingNode, argumentOfPeriapsis, satellites, atmosphere
  } = props.orbital

  // connect to the store
  const currentTime = useStore((state: State) => state.currentTime)
  const animationSpeed = useStore((state: State) => state.animationSpeed)
  const scale = useStore((state: State) => state.scale)
  const orbitals = useStore((state: State) => state.orbitals)
  const focusedOrbitalId = useStore((state: State) => state.focusedOrbitalId)
  const isChangingFocus = useStore((state: State) => state.isChangingFocus)
  const setOrbitalPosition = useStore((state: State) => state.setOrbitalPosition)
  const setFocusedOrbital = useStore((state: State) => state.setFocusedOrbital)

  // A moon's orbit scales with the size multiplier (so it grows with its planet);
  // sun-centric orbits stay at their true JSON distance. The body sphere always
  // scales. Memoized so the drawn ellipse rebuilds only when these change.
  const orbitMultiplier = props.isSatellite ? scale : 1
  const path = useMemo(
    () => createEllipticalPath(semimajor * orbitMultiplier, semiminor * orbitMultiplier),
    [semimajor, semiminor, orbitMultiplier]
  )

  // physics expects time in seconds; the store clock is in milliseconds
  const percent = ellipticPercent(eccentricity, currentTime / 1000, periapses)
  const nextPosition = getPosition(percent, path, group.current)

  // Sun-centric bodies are always labeled. A moon's label only shows when a body
  // in its own system (its planet or one of that planet's moons) is focused AND
  // the camera is zoomed in close enough — otherwise moon labels clutter the view.
  const inFocusedSystem = Boolean(props.focusGroupIds?.includes(focusedOrbitalId))
  const [inLabelRange, setInLabelRange] = useState(false)
  // hide every label while the camera is in transit between orbitals
  const showLabel = !isChangingFocus && (props.isSatellite ? (inFocusedSystem && inLabelRange) : true)

  useFrame((state) => {
    const coordinates = getWorldPosition(group.current, nextPosition)
    setOrbitalPosition(id, coordinates)

    if (props.isSatellite) {
      state.camera.getWorldPosition(cameraWorldPosition)
      const inRange = cameraWorldPosition.distanceTo(coordinates.world) < Camera.SATELLITE_LABEL_RANGE
      if (inRange !== inLabelRange) {
        setInLabelRange(inRange)
      }
    }
  })

  /**
   * Click event handler for the Orbital group.
   * Informs the store that the camera should dolly in to this planet/satellite.
   */
  const onClick = (e: any) => {
    e.stopPropagation()
    const scaledTransition = TRANSITION_TIME * Math.pow(10, animationSpeed)
    const endTimeOfTransition = currentTime + scaledTransition
    const percentAtEndOfTransition = ellipticPercent(eccentricity, endTimeOfTransition / 1000, periapses)
    const position = getPosition(percentAtEndOfTransition, path, group.current)

    setFocusedOrbital(id, getWorldPosition(group.current, position).world)
  }

  // orient the orbital plane relative to the ecliptic (barycentric rotations)
  const eclipticRotation = getEclipticRotation(longitudeOfAscendingNode)
  const orbitalRotation = getOrbitalRotation(inclination, argumentOfPeriapsis)

  // body radius is kept in km on the orbital data; scale it for the scene
  const bodyRadius = Scale(radius, scale)

  // Render satellites as children of the (moving) body so they orbit it. Each
  // reads the same size multiplier from the store, so moon radii and orbits stay
  // true to the JSON data's sizes and distances relative to their planet. The
  // system's ids (this planet + its moons) gate when each moon's label shows.
  const systemIds = [id, ...satellites]
  const satelliteComponents = satellites
    .map((satelliteId: string) => orbitals[satelliteId])
    .filter(Boolean)
    .map((satellite: IOrbital) => (
      <Orbital orbital={satellite} isSatellite focusGroupIds={systemIds} key={satellite.id} />
    ))

  return (
    <group rotation={eclipticRotation}>
      <group ref={group} rotation={orbitalRotation}>
        <Ellipse geometry={path} color={atmosphere} />
        <group ref={orbital} position={nextPosition}>
          <mesh onClick={onClick}>
            <sphereGeometry attach="geometry" args={[bodyRadius, 32, 32]} />
            <meshNormalMaterial attach="material" />
          </mesh>
          {showLabel && (
            <Html className="orbital-label" center>
              <span className="orbital-label__hit" onClick={onClick}>{name}</span>
            </Html>
          )}
          {satelliteComponents}
        </group>
      </group>
    </group>
  )
}

export default Orbital
