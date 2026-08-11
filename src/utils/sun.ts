import { Camera, Vector3 } from 'three'
import { Constants } from '../constants'
import { getApparentRadius } from './camera'

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
 * Returns the apparent radius (in px) of the corona visible from the given distance.
 */
export function getScreenRadius(distance: number, fov: number, viewportHeight: number): number {
  return getDrawnRadius(distance, fov, viewportHeight) / (viewportHeight / 2)
}

/**
 * Returns the bearing the camera holds on the sun, in radians.
 */
export function getSunBearing(position: Vector3): number {
  return Math.atan2(position.x, position.z)
}
