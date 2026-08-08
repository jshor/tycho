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
  periapses: Periapses
  labelColor?: string
}

export class Ellipse {
  semimajor: number
  semiminor: number
  eccentricity: number
  ellipse: THREE.EllipseCurve
  path: THREE.CurvePath<THREE.Vector2>
  periapses: Periapses
  color: THREE.Color
  time = 0
  pathVertices: THREE.Vector3[] = []
  trailVertices: THREE.Vector3[] = []

  constructor({ semimajor, semiminor, eccentricity, periapses, labelColor = '#ffffff' }: EllipseProps) {
    this.semimajor = semimajor
    this.semiminor = semiminor
    this.eccentricity = eccentricity
    this.periapses = periapses
    this.color = new THREE.Color(labelColor)
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

  updateTime(time: number) {
    this.time = time
    this.pathVertices = this.getPathVertices()
    this.trailVertices = this.getTrailingVertices()
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

  /**
   * Returns a list of all vertices along the elliptical path.
   */
  getPathVertices = (): THREE.Vector3[] => {
    return this.ellipse
      .getPoints(Constants.WebGL.Ellipse.POINTS)
      .map((v: THREE.Vector2) => new THREE.Vector3(v.x, v.y, 0))
  }

  /**
   * Returns the vertices for the "fading trail" of the orbital path.
   */
  getTrailingVertices(): THREE.Vector3[] {
    const pathVertices = this.pathVertices
    const total = pathVertices.length - 1
    const trail: THREE.Vector3[] = new Array(total + 1)
    const passed = Math.floor((this.getVertexPercent()) * total)

    trail[0] = this.getPosition()

    for (let i = 0; i < total; i++) {
      trail[i + 1] = pathVertices[(((passed - i) % total) + total) % total]
    }

    return trail
  }

  getTrailingPathColors() {
    const { r, g, b } = this.color
    const total = this.trailVertices.length
    const colors: [number, number, number, number][] = new Array(total)

    for (let i = 0; i < total; i++) {
      colors[i] = [r, g, b, 1 - i / (total - 1)]
    }

    return colors
  }

  /**
   * Returns the current position of the body (in 2D-vector space) along the elliptical path
   */
  getPosition = (): THREE.Vector3 => {
    const percent = PhysicsService.ellipticPercent(this.eccentricity, this.time, this.periapses)
    const vector2d = this.path.getPoint(percent)

    return new THREE.Vector3(vector2d.x, vector2d.y)
  }

  /**
   * Returns the percentage of travel along the elliptical path [0, 1] to its periapsis.
   */
  getVertexPercent = (): number => {
    const percent = PhysicsService.ellipticPercent(this.eccentricity, this.time, this.periapses)

    return this.ellipse.getUtoTmapping(percent, 0)
  }
}
