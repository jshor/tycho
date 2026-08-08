import React, { useMemo, useState } from 'react'
import { useStore } from '../store'
import { Ellipse } from '../elements/ellipse'
import { Orbital as OrbitalView } from '../components/orbital/orbital'
import { Clouds } from '../components/orbital/clouds/clouds'
import { Texture } from './texture'
import { OrbitalData, TextureMap } from '../types'
import { DoubleSide, Euler, Vector3Like } from 'three'
import { Constants } from '../constants'
import { Scale, getVisibleRadius } from '../utils/scale'
import { MathService } from '../utils/math'

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
  const [ellipse] = useState(() => new Ellipse(props))
  const time = useStore((state) => state.time)
  const targetId = useStore((state) => state.targetId)
  const setActiveOrbitalId = useStore((state) => state.setActiveOrbitalId)
  const setHighlightedId = useStore((state) => state.setHighlightedId)
  const isHighlighted = useStore((state) => state.highlightedId === id)
  const ASCENSION = 90

  /**
   * Converts a set of rotation coordinates in degrees to a `THREE.Euler` instance.
   */
  function toEuler({ x, y, z }: Partial<Vector3Like>): Euler {
    /** Degrees tp radians. */
    const rad = (v?: number): number => {
      if (v) {
        return MathService.toRadians(v)
      }
      return 0
    }
    return new Euler(rad(x), rad(y), rad(z))
  }

  /**
   * Rotation with respect to the **ecliptic** plane.
   */
  const eclipticGroupRotation = useMemo(() => {
    const ascension = isSatellite ? 0 : -ASCENSION

    return toEuler({
      x: ascension,
      z: ASCENSION + props.longitudeOfAscendingNode
    })
  }, [isSatellite, props.longitudeOfAscendingNode])

  /**
   * Rotation with respect to the **orbital** plane.
   */
  const orbitalGroupRotation = useMemo(() => {
    return toEuler({
      x: props.inclination,
      z: ASCENSION + props.argumentOfPeriapsis
    })
  }, [props.inclination, props.argumentOfPeriapsis])

  /**
   * The current rotation of the orbital body itself, with respect to its own axis.
   */
  const orbitalRotation = useMemo(() => {
    const unixTimeToDays = time / 60 / 60 / 24
    // TODO: 0.6 is the offset needed to make earth align to the sun at the right time; add this as a constant to the config JSON
    const percentRotated = unixTimeToDays / props.sidereal + (0.6 % 1)

    return toEuler({
      x: ASCENSION + props.axialTilt,
      y: percentRotated * 360
    })
  }, [time, props.axialTilt, props.sidereal])

  /**
   * The maximum distance at which the camera can be zoomed out to and still see the orbital's label.
   */
  const maxDistance = useMemo(() => {
    return isSatellite ? Constants.WebGL.Camera.SATELLITE_LABEL_RANGE : Infinity
  }, [isSatellite])

  /**
   * Opacity of the orbital path.
   */
  const pathOpacity = useMemo(() => {
    return isHighlighted ? Constants.UI.HOVER_OPACITY_ON : Constants.UI.HOVER_OPACITY_OFF
  }, [isHighlighted])

  /** Updates the orbital path's time. */
  useMemo(() => ellipse.updateTime(time), [time, ellipse])

  return (
    <OrbitalView
      eclipticGroupRotation={eclipticGroupRotation}
      orbitalGroupRotation={orbitalGroupRotation}
      ellipse={ellipse}
      pathOpacity={pathOpacity}
      atmosphereHeightKm={props.atmosphereHeightKm}
      atmosphereColor={props.atmosphereColor}
      maxDistance={maxDistance}
      tail={props.tail}
      text={props.name}
      radius={props.radius}
      isFocused={id === targetId}
      parentId={parentId}
      isSatellite={isSatellite}
      id={id}
      onFocus={() => setActiveOrbitalId(id)}
      onHover={() => setHighlightedId(id)}
      onLeave={() => setHighlightedId(undefined)}
    >
      <group>
        {/* the orbital body */}
        <mesh rotation={orbitalRotation}>
          <sphereGeometry
            args={[
              Scale(getVisibleRadius(props.radius)),
              Constants.WebGL.SPHERE_SEGMENTS,
              Constants.WebGL.SPHERE_SEGMENTS
            ]}
          />
          <Texture textures={props.maps} />
        </mesh>

        {/* clouds (if any) */}
        {props.clouds && (
          <Clouds radius={props.radius} url={props.clouds} rotation={orbitalRotation} />
        )}

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
