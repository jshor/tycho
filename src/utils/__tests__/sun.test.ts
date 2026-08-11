import { PerspectiveCamera, Vector3 } from 'three'
import { Constants } from '../../constants'
import { getApparentRadius, getMinDistance } from '../camera'
import {
  getDrawnRadius,
  getScreenRadius,
  getSunBearing,
  getSunDistance,
  isSunInFront
} from '../sun'

describe('Sun Service', () => {
  const FOV = Constants.WebGL.Camera.FOV
  const HEIGHT = 800
  const EARTH_ORBIT = 149.6

  const cameraAt = (distance: number, lookingAt = new Vector3(0, 0, 0)) => {
    const camera = new PerspectiveCamera(FOV, 1.5)

    camera.position.set(0, 0, distance)
    camera.lookAt(lookingAt)
    camera.updateMatrixWorld()

    return camera
  }

  describe('getSunDistance()', () => {
    it('should measure the camera against the origin the sun stands at', () => {
      expect(getSunDistance(cameraAt(EARTH_ORBIT), new Vector3())).toBeCloseTo(EARTH_ORBIT)
    })

    it('should leave the camera position in the vector it is handed', () => {
      const position = new Vector3()

      getSunDistance(cameraAt(30), position)

      expect(position.z).toBeCloseTo(30)
    })

    it('should read nothing at all from a camera sat on the sun', () => {
      expect(getSunDistance(cameraAt(0), new Vector3())).toBe(0)
    })
  })

  describe('isSunInFront()', () => {
    const facing = (camera: PerspectiveCamera) => {
      const position = new Vector3()

      getSunDistance(camera, position)

      return isSunInFront(camera, position, new Vector3())
    }

    it('should find the sun ahead of a camera looking at it', () => {
      expect(facing(cameraAt(EARTH_ORBIT))).toBe(true)
    })

    it('should find the sun behind a camera turned away from it', () => {
      expect(facing(cameraAt(EARTH_ORBIT, new Vector3(0, 0, EARTH_ORBIT * 2)))).toBe(false)
    })

    it('should keep the sun ahead of a camera holding it at the edge of the frame', () => {
      expect(facing(cameraAt(EARTH_ORBIT, new Vector3(EARTH_ORBIT, 0, 0)))).toBe(true)
    })

    it('should find nothing to see from a camera sitting on the sun', () => {
      expect(facing(cameraAt(0))).toBe(false)
    })

    it('should find nothing to see from a camera nearer than it can clip', () => {
      const { NEAR_MIN } = Constants.WebGL.Camera

      expect(facing(cameraAt(NEAR_MIN / 2, new Vector3(0, 0, -1)))).toBe(false)
    })

    it('should show the sun again once the camera has backed off far enough to clip it', () => {
      const { NEAR_MIN } = Constants.WebGL.Camera

      expect(facing(cameraAt(NEAR_MIN * 100, new Vector3(0, 0, -1)))).toBe(true)
    })
  })

  describe('getDrawnRadius()', () => {
    it('should draw the sun at the size it truly appears from where the camera stands', () => {
      const { RADIUS } = Constants.WebGL.Sun

      expect(getDrawnRadius(EARTH_ORBIT, FOV, HEIGHT)).toBeCloseTo(
        getApparentRadius(RADIUS, EARTH_ORBIT, FOV, HEIGHT)
      )
    })

    it('should grow the sun as the camera closes on it', () => {
      const near = getDrawnRadius(20, FOV, HEIGHT)
      const far = getDrawnRadius(200, FOV, HEIGHT)

      expect(near).toBeGreaterThan(far)
      expect(near).toBeCloseTo(far * 10)
    })

    it('should keep answering the zoom right up to the closest the camera may come', () => {
      const closest = getMinDistance(Constants.WebGL.Sun.RADIUS, 1.5)
      const nearer = getDrawnRadius(closest, FOV, HEIGHT)
      const further = getDrawnRadius(closest * 1.2, FOV, HEIGHT)

      expect(nearer).toBeGreaterThan(further)
    })

    it('should keep shrinking the sun the whole way out to the edge of the system', () => {
      const acrossTheSystem = Constants.WebGL.Camera.MAX_DISTANCE
      const far = getDrawnRadius(acrossTheSystem / 2, FOV, HEIGHT)
      const further = getDrawnRadius(acrossTheSystem, FOV, HEIGHT)

      expect(further).toBeLessThan(far)
      expect(further).toBeGreaterThan(0)
    })

    it('should fill most of the frame with the sun at the closest the camera may come', () => {
      const closest = getMinDistance(Constants.WebGL.Sun.RADIUS, 1.5)
      const share = (getDrawnRadius(closest, FOV, HEIGHT) * 2) / HEIGHT

      expect(share).toBeGreaterThan(0.5)
      expect(share).toBeLessThanOrEqual(1)
    })

    it('should spread the sun over more of a shorter viewport', () => {
      const tall = getDrawnRadius(EARTH_ORBIT, FOV, HEIGHT)
      const short = getDrawnRadius(EARTH_ORBIT, FOV, HEIGHT / 2)

      expect(short).toBeCloseTo(tall / 2)
    })
  })

  describe('getScreenRadius()', () => {
    it('should measure the disc against half the height of the viewport', () => {
      const screen = getScreenRadius(EARTH_ORBIT, FOV, HEIGHT)

      expect(screen).toBeCloseTo(getDrawnRadius(EARTH_ORBIT, FOV, HEIGHT) / (HEIGHT / 2))
    })

    it('should measure a sun that fills the frame at about a whole unit across', () => {
      const closest = getMinDistance(Constants.WebGL.Sun.RADIUS, 1.5)

      expect(getScreenRadius(closest, FOV, HEIGHT)).toBeGreaterThan(0.5)
      expect(getScreenRadius(closest, FOV, HEIGHT)).toBeLessThanOrEqual(1)
    })

    it('should keep the sun a slip of the screen from out in the system', () => {
      expect(getScreenRadius(EARTH_ORBIT, FOV, HEIGHT)).toBeLessThan(0.1)
    })
  })

  describe('getSunBearing()', () => {
    it('should read nothing from a camera stood along the z axis', () => {
      expect(getSunBearing(new Vector3(0, 0, 10))).toBeCloseTo(0)
    })

    it('should turn a quarter as the camera swings onto the x axis', () => {
      expect(getSunBearing(new Vector3(10, 0, 0))).toBeCloseTo(Math.PI / 2)
    })

    it('should ignore how high the camera is stood, reading only the bearing', () => {
      expect(getSunBearing(new Vector3(0, 500, 10))).toBeCloseTo(
        getSunBearing(new Vector3(0, 0, 1))
      )
    })

    it('should hold the same bearing however far out the camera stands', () => {
      const near = getSunBearing(new Vector3(3, 0, 4))
      const far = getSunBearing(new Vector3(3000, 0, 4000))

      expect(near).toBeCloseTo(far)
    })
  })
})
