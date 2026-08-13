import { Camera, MathUtils, Object3D, Vector2, Vector3 } from 'three'
import { Constants } from '../constants'
import { OrbitalData } from '../types'
import { getApparentRadius } from './camera'

export interface OccludingBody {
  /** The occluding body scene object. */
  object: Object3D
  /** The radius of the body, in km. */
  radius: number
}

export interface SunOccluder {
  /** Where the center of the body is on screen, in NDC. */
  x: number
  /** Where the center of the body is on screen, in NDC. */
  y: number
  /** How far the body's disc reaches on screen, measured against half the viewport's height. */
  radius: number
  /** Distance between the body on the screen and the sun's center, in NDC. */
  gap: number
  /** Percentage of occlusion, from 0 (clear) to 1 (eclipsed). */
  coverage: number
}

/** Position of the the sun on the screen. */
export interface SunView {
  /** Where the sun is on screen, in NDC. */
  position: Vector2
  /** How far the sun's disc reaches on screen, measured against half the viewport's height. */
  size: number
  /** How far the camera stands from the sun, in scene units. */
  distance: number
  /** The shape of the viewport, as its width over its height. */
  aspectRatio: number
  /** The field of view the camera renders at, in degrees. */
  fov: number
  /** The height of the viewport, in px. */
  height: number
}

/**
 * Returns the camera's distance from the sun.
 */
export function getSunDistance(camera: Camera, into: Vector3): number {
  return into.setFromMatrixPosition(camera.matrixWorld).length()
}

/**
 * Returns whether or not the sun is anywhere in front of the camera.
 */
export function isSunInFront(camera: Camera, position: Vector3, heading: Vector3): boolean {
  if (position.length() < Constants.WebGL.Camera.NEAR_MIN) {
    return false
  }

  // the sun's at the origin, so the camera's vector is pointing away from it
  return camera.getWorldDirection(heading).dot(position) < 0
}

/**
 * Returns the apparent radius (in px) of the sun's disc visible from the given distance.
 */
export function getDrawnRadius(distance: number, fov: number, viewportHeight: number): number {
  return getApparentRadius(Constants.WebGL.Sun.RADIUS, distance, fov, viewportHeight)
}

/**
 * Returns how far a body of the given radius reaches on screen, measured against half the
 * height of the viewport, as the sun's own disc is.
 */
export function getBodyRadius(
  radius: number,
  distance: number,
  fov: number,
  viewportHeight: number
): number {
  return getApparentRadius(radius, distance, fov, viewportHeight) / (viewportHeight / 2)
}

/**
 * Returns the apparent radius (in px) of the corona visible from the given distance.
 */
export function getScreenRadius(distance: number, fov: number, viewportHeight: number): number {
  return getDrawnRadius(distance, fov, viewportHeight) / (viewportHeight / 2)
}

/**
 * Returns how far a point on screen sits from another, with the shape of the viewport taken
 * into account so that a disc measured against its height stays round.
 */
export function getScreenGap(x: number, y: number, from: Vector2, aspectRatio: number): number {
  return Math.hypot((x - from.x) * aspectRatio, y - from.y)
}

/**
 * Returns how much of a disc of the given radius another disc covers, from 0 to 1, given how
 * far apart the two sit.
 */
export function getDiscCoverage(radius: number, cover: number, gap: number): number {
  if (radius <= 0 || cover <= 0 || gap >= radius + cover) {
    return 0
  }

  // the disc is swallowed whole by one that reaches past both its edges
  if (gap <= cover - radius) {
    return 1
  }

  // a smaller disc sat entirely within it takes its own area out of it
  if (gap <= radius - cover) {
    return (cover * cover) / (radius * radius)
  }

  // the discs overlap in a lens, whose area is the two circular segments either side of the chord
  const disc = radius * radius
  const body = cover * cover
  const span = gap * gap
  const wedge = disc * Math.acos(clampCosine((span + disc - body) / (2 * gap * radius)))
  const cap = body * Math.acos(clampCosine((span + body - disc) / (2 * gap * cover)))
  const chord = Math.sqrt(
    Math.max(
      (cover + radius - gap) *
        (gap + cover - radius) *
        (gap - cover + radius) *
        (gap + cover + radius),
      0
    )
  )

  return MathUtils.clamp((wedge + cap - chord / 2) / (Math.PI * disc), 0, 1)
}

/**
 * Holds a cosine within the range an angle may be read back out of it.
 */
function clampCosine(value: number): number {
  return MathUtils.clamp(value, -1, 1)
}

/**
 * Returns the bodies standing between the camera and the sun, the ones most in the way of it
 * first, and no more of them than the corona can mask at once.
 */
export function getSunOccluders(
  camera: Camera,
  bodies: OccludingBody[],
  view: SunView
): SunOccluder[] {
  const eye = new Vector3().setFromMatrixPosition(camera.matrixWorld)
  const heading = camera.getWorldDirection(new Vector3())
  const point = new Vector3()
  const offset = new Vector3()
  const occluders: SunOccluder[] = []

  bodies.forEach(({ object, radius }) => {
    object.getWorldPosition(point)
    offset.subVectors(point, eye)

    const distance = offset.length()

    // a body no nearer than the sun, or stood behind the camera, cannot come in front of it
    if (distance <= 0 || distance >= view.distance || offset.dot(heading) <= 0) {
      return
    }

    const { x, y } = point.project(camera)
    const drawn = getBodyRadius(radius, distance, view.fov, view.height)
    const gap = getScreenGap(x, y, view.position, view.aspectRatio)

    occluders.push({ x, y, radius: drawn, gap, coverage: getDiscCoverage(view.size, drawn, gap) })
  })

  // the bodies whose discs reach furthest past the sun are the ones worth masking
  return occluders
    .sort((one, other) => other.radius - other.gap - (one.radius - one.gap))
    .slice(0, Constants.WebGL.Sun.MAX_OCCLUDERS)
}

/**
 * Returns how much of the sun the given bodies cover between them, from 0 to 1.
 */
export function getSunOcclusion(occluders: SunOccluder[]): number {
  return occluders.reduce((covered, { coverage }) => Math.max(covered, coverage), 0)
}

/**
 * Returns the bodies of the given orbitals that have been rendered into the given scene.
 */
export function getOccludingBodies(scene: Object3D, orbitals: OrbitalData[] = []): OccludingBody[] {
  return orbitals.flatMap(({ id, radius, satellites }) => {
    const object = scene.getObjectByName(id)
    const moons = getOccludingBodies(scene, satellites)

    return object ? [{ object, radius }, ...moons] : moons
  })
}

/**
 * Returns how many bodies the given orbitals hold between them.
 */
export function countBodies(orbitals: OrbitalData[] = []): number {
  return orbitals.reduce((count, { satellites }) => count + 1 + countBodies(satellites), 0)
}

/**
 * Returns the bearing the camera holds on the sun, in radians.
 */
export function getSunBearing(position: Vector3): number {
  return Math.atan2(position.x, position.z)
}
