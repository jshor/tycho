import * as THREE from 'three'
import MathService from './MathService'
import PhysicsService from './PhysicsService'
import Constants from '../constants'
import { OrbitalData, OrbitalStats, Periapses } from '../types'
import Ellipse from '../utils/Ellipse'

interface RotationCoords {
  x?: number
  y?: number
  z?: number
}

export default class OrbitalService {
  static ASCENSION = 90

  static getEclipticGroupRotation = ({
    longitudeOfAscendingNode,
    isSatellite
  }: {
    longitudeOfAscendingNode: number
    isSatellite?: boolean
  }): THREE.Euler => {
    const ascension = isSatellite ? 0 : -OrbitalService.ASCENSION

    return OrbitalService.toEuler({
      x: ascension,
      z: OrbitalService.ASCENSION + longitudeOfAscendingNode
    })
  }

  static getOrbitalGroupRotation = ({
    inclination,
    argumentOfPeriapsis
  }: {
    inclination: number
    argumentOfPeriapsis: number
  }): THREE.Euler => {
    return OrbitalService.toEuler({
      x: inclination,
      z: OrbitalService.ASCENSION + argumentOfPeriapsis
    })
  }

  static getBodyRotation = ({
    axialTilt,
    sidereal,
    time
  }: {
    axialTilt: number
    sidereal: number
    time?: number
  }): THREE.Euler => {
    return OrbitalService.toEuler({
      x: OrbitalService.ASCENSION + axialTilt,
      y: OrbitalService.getRotationCompleted(sidereal, time)
    })
  }

  static getRotationCompleted = (sidereal: number, time: number): number => {
    const unixTimeToDays = time / 60 / 60 / 24
    // TODO: 0.6 is the offset needed to make earth align to the sun at the right time; add this as a constant to the config JSON
    const percentRotated = unixTimeToDays / sidereal + (0.6 % 1)
    return percentRotated * 360
  }

  /**
   *Returns the percentage of travel along the elliptical path [0, 1] to its periapsis.
   */
  static getBodyPercent = (
    { periapses, time }: { periapses: Periapses; time?: number },
    ellipse: Ellipse
  ): number => {
    return ellipse.getVertexPercent(time, periapses)
  }

  static getBodyPosition = (
    { periapses, time }: { periapses: Periapses; time?: number },
    ellipse: Ellipse
  ): THREE.Vector3 => {
    return ellipse.getPosition(time, periapses)
  }

  static getPathOpacity = (
    { id }: { id: string },
    highlightedOrbitals: string[] | undefined,
    force?: boolean
  ): number => {
    if (force) {
      return Constants.UI.HOVER_OPACITY_ON
    } else if (Array.isArray(highlightedOrbitals)) {
      const isHighlighted = highlightedOrbitals.filter((orbital) => orbital === id).length

      if (isHighlighted) {
        return Constants.UI.HOVER_OPACITY_ON
      }
    }
    return Constants.UI.HOVER_OPACITY_OFF
  }

  static getMaxViewDistance = ({ isSatellite }: { isSatellite?: boolean }): number => {
    if (isSatellite) {
      return Constants.WebGL.Camera.SATELLITE_LABEL_RANGE
    }
    return Infinity
  }

  static toEuler = ({ x, y, z }: RotationCoords): THREE.Euler => {
    const rad = (v?: number): number => {
      if (v) {
        return MathService.toRadians(v)
      }
      return 0
    }
    return new THREE.Euler(rad(x), rad(y), rad(z))
  }

  static getTargetByName = (
    orbitals: OrbitalData[],
    targetName: string
  ): OrbitalData | undefined => {
    let target: OrbitalData | undefined

    orbitals.forEach((orbital) => {
      if (!target) {
        if (orbital.id === targetName) {
          target = orbital
        } else if (orbital.satellites) {
          target = OrbitalService.getTargetByName(orbital.satellites, targetName)
        }
      }
    })
    return target
  }

  static formatStat = (x: number): string => {
    return x
      .toFixed(3)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  static getOrbitalStats = (target: OrbitalData, time: number): OrbitalStats => {
    const { eccentricity, periapses, centralMass, semimajor } = target

    const { distance, trueAnomaly } = PhysicsService.getDistanceFromAttractingBody(
      eccentricity,
      time,
      periapses,
      semimajor
    )
    const energy = PhysicsService.orbitalEnergyConservation(centralMass, distance, semimajor)

    return {
      magnitude: OrbitalService.formatStat(distance),
      velocity: OrbitalService.formatStat(energy),
      trueAnomaly: OrbitalService.formatStat(trueAnomaly)
    }
  }
}
