import * as THREE from 'three'
import { Constants } from '../constants'
import { PhysicsService } from '../services/PhysicsService'
import { MathService } from '../services/MathService'
import { Scale } from '../utils/Scale'
import { Periapses } from '../types'

interface EllipseProps {
  semimajor: number
  semiminor: number
  eccentricity: number
}

export class Ellipse {
  semimajor: number
  semiminor: number
  eccentricity: number
  ellipse: THREE.EllipseCurve
  path: THREE.CurvePath<THREE.Vector2>

  constructor({ semimajor, semiminor, eccentricity }: EllipseProps) {
    this.semimajor = semimajor
    this.semiminor = semiminor
    this.eccentricity = eccentricity
    this.render()
  }

  render = (): void => {
    this.ellipse = this.getEllipseCurve()
    this.path = this.getPath()
    this.path.add(this.ellipse)
  }

  getPath = (): THREE.CurvePath<THREE.Vector2> => {
    return new THREE.CurvePath<THREE.Vector2>()
  }

  getEllipseCurve = (): THREE.EllipseCurve => {
    const semimajor = Scale(this.semimajor)
    const semiminor = Scale(this.semiminor)
    const focus = MathService.getFocus(semimajor, semiminor)

    return new THREE.EllipseCurve(
      0,
      focus,
      semiminor,
      semimajor,
      Constants.WebGL.Ellipse.START,
      Constants.WebGL.Ellipse.END
    )
  }

  getVertices = (): THREE.Vector3[] => {
    return this.ellipse
      .getPoints(Constants.WebGL.Ellipse.POINTS)
      .map((v: THREE.Vector2) => new THREE.Vector3(v.x, v.y, 0))
  }

  getPosition = (time: number, periapses: Periapses): THREE.Vector3 => {
    const percent = PhysicsService.ellipticPercent(this.eccentricity, time, periapses)
    const vector2d = this.path.getPoint(percent)

    return new THREE.Vector3(vector2d.x, vector2d.y)
  }

  /**
   *Returns the percentage of travel along the elliptical path [0, 1] to its periapsis.
   */
  getVertexPercent = (time: number, periapses: Periapses): number => {
    const percent = PhysicsService.ellipticPercent(this.eccentricity, time, periapses)

    return this.ellipse.getUtoTmapping(percent, 0)
  }
}
