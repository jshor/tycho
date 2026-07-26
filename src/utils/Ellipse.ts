import * as THREE from 'three'
import Constants from '../constants'
import PhysicsService from '../services/PhysicsService'
import MathService from '../services/MathService'
import Scale from '../utils/Scale'
import { Periapses } from '../types'

interface EllipseProps {
  semimajor: number
  semiminor: number
  eccentricity: number
  scale: number
}

export default class Ellipse {
  semimajor: number
  semiminor: number
  eccentricity: number
  scale: number
  ellipse: THREE.EllipseCurve
  path: any

  constructor({ semimajor, semiminor, eccentricity, scale }: EllipseProps) {
    this.semimajor = semimajor
    this.semiminor = semiminor
    this.eccentricity = eccentricity
    this.setScale(scale)
  }

  render = (): void => {
    this.ellipse = this.getEllipseCurve()
    this.path = this.getPath()
    this.path.add(this.ellipse)
  }

  getPath = (): any => {
    return new THREE.CurvePath()
  }

  getEllipseCurve = (): THREE.EllipseCurve => {
    const semimajor = Scale(this.semimajor, this.scale)
    const semiminor = Scale(this.semiminor, this.scale)
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
    return (
      this.ellipse.getPoints(Constants.WebGL.Ellipse.POINTS) as unknown as THREE.Vector2[]
    ).map((v: THREE.Vector2) => new THREE.Vector3(v.x, v.y, 0))
  }

  getPosition = (time: number, periapses: Periapses): THREE.Vector3 => {
    const percent = PhysicsService.ellipticPercent(this.eccentricity, time, periapses)
    const vector2d = this.path.getPoint(percent)

    return new THREE.Vector3(vector2d.x, vector2d.y)
  }

  setScale = (scale: number): void => {
    this.scale = scale
    this.render()
  }
}
