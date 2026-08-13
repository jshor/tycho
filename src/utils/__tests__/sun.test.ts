import { Mesh, Object3D, PerspectiveCamera, Scene, Vector2, Vector3 } from 'three'
import { Constants } from '../../constants'
import { OrbitalData } from '../../types'
import { getApparentRadius, getMinDistance } from '../camera'
import { Scale } from '../scale'
import {
  countBodies,
  getBodyRadius,
  getDiscCoverage,
  getDrawnRadius,
  getOccludingBodies,
  getScreenGap,
  getScreenRadius,
  getSunBearing,
  getSunDistance,
  getSunOcclusion,
  getSunOccluders,
  isSunInFront,
  OccludingBody,
  SunView
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

  describe('getBodyRadius()', () => {
    const EARTH_RADIUS = 6371

    it('should measure a body against half the height of the viewport, as the sun is', () => {
      const drawn = getApparentRadius(EARTH_RADIUS, 1, FOV, HEIGHT)

      expect(getBodyRadius(EARTH_RADIUS, 1, FOV, HEIGHT)).toBeCloseTo(drawn / (HEIGHT / 2))
    })

    it('should measure the sun itself the way the corona already does', () => {
      const { RADIUS } = Constants.WebGL.Sun

      expect(getBodyRadius(RADIUS, EARTH_ORBIT, FOV, HEIGHT)).toBeCloseTo(
        getScreenRadius(EARTH_ORBIT, FOV, HEIGHT)
      )
    })

    it('should draw a body hanging over the camera larger than the sun it stands in front of', () => {
      const overhead = getBodyRadius(EARTH_RADIUS, Scale(EARTH_RADIUS) * 1.1, FOV, HEIGHT)

      expect(overhead).toBeGreaterThan(getScreenRadius(EARTH_ORBIT, FOV, HEIGHT))
    })
  })

  describe('getScreenGap()', () => {
    const middle = new Vector2(0, 0)

    it('should read nothing between a point and itself', () => {
      expect(getScreenGap(0.2, -0.4, new Vector2(0.2, -0.4), 1.5)).toBeCloseTo(0)
    })

    it('should measure the height of the screen as it stands', () => {
      expect(getScreenGap(0, 0.5, middle, 1.5)).toBeCloseTo(0.5)
    })

    it('should stretch the width by the shape of the viewport, so discs stay round', () => {
      expect(getScreenGap(0.5, 0, middle, 1.5)).toBeCloseTo(0.75)
    })
  })

  describe('getDiscCoverage()', () => {
    const DISC = 0.1

    it('should cover nothing with a body that sits clear of the disc', () => {
      expect(getDiscCoverage(DISC, DISC, DISC * 2.01)).toEqual(0)
    })

    it('should cover nothing with a body that only just fails to reach it', () => {
      expect(getDiscCoverage(DISC, DISC / 2, DISC * 1.5)).toEqual(0)
    })

    it('should cover the disc entirely with a body swallowing it whole', () => {
      expect(getDiscCoverage(DISC, DISC * 4, 0)).toEqual(1)
      expect(getDiscCoverage(DISC, DISC * 4, DISC * 2)).toEqual(1)
    })

    it('should cover the disc entirely with a body sat exactly over it', () => {
      expect(getDiscCoverage(DISC, DISC, 0)).toEqual(1)
    })

    it('should take only its own share out of a body sat within the disc', () => {
      expect(getDiscCoverage(DISC, DISC / 2, DISC / 4)).toBeCloseTo(0.25)
    })

    it('should cover half the disc with a body reaching exactly to its center', () => {
      expect(getDiscCoverage(DISC, DISC, DISC)).toBeCloseTo(0.391, 2)
    })

    it('should grow the cover as the body drifts across the disc', () => {
      const entering = getDiscCoverage(DISC, DISC, DISC * 1.5)
      const halfway = getDiscCoverage(DISC, DISC, DISC)
      const nearly = getDiscCoverage(DISC, DISC, DISC / 2)

      expect(entering).toBeLessThan(halfway)
      expect(halfway).toBeLessThan(nearly)
      expect(nearly).toBeLessThan(1)
    })

    it('should hold the cover within its bounds however the two discs are sized', () => {
      const gaps = [0, 0.01, 0.05, 0.1, 0.2, 0.5, 1]
      const sizes = [0.001, 0.01, 0.1, 1]

      sizes.forEach((cover) =>
        gaps.forEach((gap) => {
          const coverage = getDiscCoverage(DISC, cover, gap)

          expect(coverage).toBeGreaterThanOrEqual(0)
          expect(coverage).toBeLessThanOrEqual(1)
        })
      )
    })

    it('should cover nothing at all when there is no disc to cover', () => {
      expect(getDiscCoverage(0, DISC, 0)).toEqual(0)
    })

    it('should cover nothing at all with a body of no width', () => {
      expect(getDiscCoverage(DISC, 0, 0)).toEqual(0)
    })
  })

  describe('getSunOccluders()', () => {
    const PLANET_RADIUS = 6371
    const view = (overrides: Partial<SunView> = {}): SunView => ({
      position: new Vector2(0, 0),
      size: getScreenRadius(EARTH_ORBIT, FOV, HEIGHT),
      distance: EARTH_ORBIT,
      aspectRatio: 1.5,
      fov: FOV,
      height: HEIGHT,
      ...overrides
    })
    const bodyAt = (position: Vector3, radius = PLANET_RADIUS): OccludingBody => {
      const object = new Object3D()

      object.position.copy(position)
      object.updateMatrixWorld()

      return { object, radius }
    }
    const camera = () => cameraAt(EARTH_ORBIT)
    const overhead = (radius = PLANET_RADIUS) =>
      bodyAt(new Vector3(0, 0, EARTH_ORBIT - 0.05), radius)

    it('should find nothing in the way when no bodies are in the scene', () => {
      expect(getSunOccluders(camera(), [], view())).toEqual([])
    })

    it('should find a body standing between the camera and the sun', () => {
      const occluders = getSunOccluders(camera(), [overhead()], view())

      expect(occluders).toHaveLength(1)
      expect(occluders[0].coverage).toEqual(1)
    })

    it('should leave the sun barely covered by a body way out along the line to it', () => {
      const distant = bodyAt(new Vector3(0, 0, EARTH_ORBIT / 2))
      const [occluder] = getSunOccluders(camera(), [distant], view())

      expect(occluder.coverage).toBeGreaterThan(0)
      expect(occluder.coverage).toBeLessThan(0.01)
    })

    it('should place the body where it is drawn on screen', () => {
      const occluders = getSunOccluders(camera(), [bodyAt(new Vector3(0, 0, 0.1))], view())

      expect(occluders[0].x).toBeCloseTo(0)
      expect(occluders[0].y).toBeCloseTo(0)
    })

    it('should carry a body off to one side as it drifts off the line to the sun', () => {
      const aside = bodyAt(new Vector3(1, 0, EARTH_ORBIT / 2))
      const [occluder] = getSunOccluders(camera(), [aside], view())

      expect(occluder.x).toBeGreaterThan(0)
      expect(occluder.gap).toBeGreaterThan(0)
    })

    it('should draw a body larger the closer it stands to the camera', () => {
      const near = getSunOccluders(camera(), [overhead()], view())
      const far = getSunOccluders(camera(), [bodyAt(new Vector3(0, 0, EARTH_ORBIT / 2))], view())

      expect(near[0].radius).toBeGreaterThan(far[0].radius)
    })

    it('should ignore a body standing further off than the sun itself', () => {
      const beyond = bodyAt(new Vector3(0, 0, -EARTH_ORBIT))

      expect(getSunOccluders(camera(), [beyond], view())).toEqual([])
    })

    it('should ignore a body standing behind the camera', () => {
      const behind = bodyAt(new Vector3(0, 0, EARTH_ORBIT * 1.5))

      expect(getSunOccluders(camera(), [behind], view())).toEqual([])
    })

    it('should ignore a body the camera has fallen right onto', () => {
      const underfoot = bodyAt(new Vector3(0, 0, EARTH_ORBIT))

      expect(getSunOccluders(camera(), [underfoot], view())).toEqual([])
    })

    it('should leave the sun clear of a body that covers none of it', () => {
      const aside = bodyAt(new Vector3(20, 0, EARTH_ORBIT / 2))
      const [occluder] = getSunOccluders(camera(), [aside], view())

      expect(occluder.coverage).toEqual(0)
      expect(occluder.radius).toBeGreaterThan(0)
    })

    it('should hand back the body most in the way of the sun first', () => {
      const bodies = [bodyAt(new Vector3(20, 0, EARTH_ORBIT / 2)), overhead()]
      const [nearest] = getSunOccluders(camera(), bodies, view())

      expect(nearest.coverage).toEqual(1)
    })

    it('should hand back no more bodies than the corona is able to mask', () => {
      const { MAX_OCCLUDERS } = Constants.WebGL.Sun
      const crowd = Array.from({ length: MAX_OCCLUDERS + 3 }, (unused, index) =>
        bodyAt(new Vector3(index, 0, EARTH_ORBIT / 2))
      )

      expect(getSunOccluders(camera(), crowd, view())).toHaveLength(MAX_OCCLUDERS)
    })

    it('should keep the bodies nearest the sun when there are too many to mask', () => {
      const { MAX_OCCLUDERS } = Constants.WebGL.Sun
      const crowd = Array.from({ length: MAX_OCCLUDERS + 3 }, (unused, index) =>
        bodyAt(new Vector3(index * 10, 0, EARTH_ORBIT / 2))
      )
      const masked = getSunOccluders(camera(), crowd, view())

      expect(masked[0].gap).toBeCloseTo(0)
      expect(masked.map(({ gap }) => gap)).toEqual([...masked.map(({ gap }) => gap)].sort((a, b) => a - b)) // prettier-ignore
    })
  })

  describe('getSunOcclusion()', () => {
    const occluder = (coverage: number) => ({ x: 0, y: 0, radius: 0.1, gap: 0, coverage })

    it('should leave the sun clear when nothing stands in front of it', () => {
      expect(getSunOcclusion([])).toEqual(0)
    })

    it('should take the cover from whichever body hides the most of the sun', () => {
      expect(getSunOcclusion([occluder(0.2), occluder(0.7), occluder(0.4)])).toEqual(0.7)
    })

    it('should hide the sun entirely behind a body that covers it whole', () => {
      expect(getSunOcclusion([occluder(0.2), occluder(1)])).toEqual(1)
    })
  })

  describe('getOccludingBodies()', () => {
    const orbitals = [
      { id: 'earth', radius: 6371, satellites: [{ id: 'luna', radius: 1737 }] },
      { id: 'mars', radius: 3390 }
    ] as OrbitalData[]

    const sceneOf = (...ids: string[]) => {
      const scene = new Scene()

      ids.forEach((id) => {
        const body = new Mesh()

        body.name = id
        scene.add(body)
      })

      return scene
    }

    it('should find nothing in a scene the orbitals have yet to reach', () => {
      expect(getOccludingBodies(sceneOf(), orbitals)).toEqual([])
    })

    it('should find nothing at all when there are no orbitals to look for', () => {
      expect(getOccludingBodies(sceneOf('earth'))).toEqual([])
    })

    it('should find the body of each orbital in the scene, alongside its radius', () => {
      const [earth] = getOccludingBodies(sceneOf('earth'), orbitals)

      expect(earth.object.name).toEqual('earth')
      expect(earth.radius).toEqual(6371)
    })

    it('should find the moons orbiting the bodies as well as the bodies themselves', () => {
      const found = getOccludingBodies(sceneOf('earth', 'luna', 'mars'), orbitals)

      expect(found.map(({ object }) => object.name)).toEqual(['earth', 'luna', 'mars'])
    })

    it('should find a moon whose parent has yet to be drawn', () => {
      const found = getOccludingBodies(sceneOf('luna'), orbitals)

      expect(found.map(({ object }) => object.name)).toEqual(['luna'])
    })
  })

  describe('countBodies()', () => {
    it('should count nothing at all before the orbitals have been fetched', () => {
      expect(countBodies()).toEqual(0)
    })

    it('should count every orbital and each of the moons they carry', () => {
      const orbitals = [
        { id: 'earth', satellites: [{ id: 'luna' }] },
        { id: 'jupiter', satellites: [{ id: 'io' }, { id: 'europa' }] }
      ] as OrbitalData[]

      expect(countBodies(orbitals)).toEqual(5)
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
