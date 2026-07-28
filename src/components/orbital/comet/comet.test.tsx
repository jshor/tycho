import { render } from '@testing-library/react'
import { Quaternion, Vector3 } from 'three'
import Comet, { getActivity, getHeading, getPlumeOrientation } from './comet'
import Constants from '../../../constants'
import { TailData } from '../../../types'

/** Halley's tail, as the orbital data configures it. */
const settings: TailData = {
  length: 100,
  width: 20,
  comaScale: 60,
  activeDistance: 450,
  restActivity: 0.18,
  dustColor: 0xfff0d0,
  ionColor: 0x66ccff
}

/** A square coutnerclockwise orbit. */
const path = [
  new Vector3(1, 0, 0),
  new Vector3(0, 0, 1),
  new Vector3(-1, 0, 0),
  new Vector3(0, 0, -1),
  new Vector3(1, 0, 0)
]

describe('Comet Component', () => {
  it('should render without crashing', () => {
    expect(() =>
      render(<Comet radius={15} settings={settings} pathVertices={path} bodyPercent={0} />)
    ).not.toThrow()
  })

  it('should render a flat coma and a conical tail', () => {
    const { container } = render(
      <Comet radius={15} settings={settings} pathVertices={path} bodyPercent={0} />
    )
    const comet = container.querySelector('group[name="comet"]')

    expect(comet?.querySelectorAll('mesh')).toHaveLength(1)
    expect(comet?.querySelectorAll('coneGeometry')).toHaveLength(1)
  })

  describe('getActivity()', () => {
    it('should vent hardest at the sun', () => {
      expect(getActivity(0, settings)).toEqual(1)
    })

    it('should fall back to a wisp once it is too far out to vent', () => {
      expect(getActivity(settings.activeDistance, settings)).toEqual(settings.restActivity)
    })

    it('should not fall below a wisp however far out it drifts', () => {
      expect(getActivity(settings.activeDistance * 100, settings)).toEqual(settings.restActivity)
    })

    it('should grow the tail as the comet comes in', () => {
      const far = getActivity(settings.activeDistance * 0.75, settings)
      const near = getActivity(settings.activeDistance * 0.25, settings)

      expect(near).toBeGreaterThan(far)
      expect(far).toBeGreaterThan(settings.restActivity)
    })

    it("should grow a full tail by the time it reaches Halley's perihelion", () => {
      const perihelion = (2667330000 * (1 - 0.967)) / Constants.WebGL.UNIT_SCALE

      expect(getActivity(perihelion, settings)).toBeGreaterThan(0.8)
    })
  })

  describe('getHeading()', () => {
    const heading = new Vector3()

    it('should point along the leg of the orbit the body is on', () => {
      const result = getHeading(path, 0, heading)

      expect(result.x).toBeCloseTo(new Vector3(-1, 0, 1).normalize().x)
      expect(result.z).toBeCloseTo(new Vector3(-1, 0, 1).normalize().z)
    })

    it('should turn with the body as it comes round the orbit', () => {
      const first = getHeading(path, 0, heading).clone()
      const opposite = getHeading(path, 0.5, heading).clone()

      expect(first.dot(opposite)).toBeCloseTo(-1)
    })

    it('should measure a real step at the very end of the orbit', () => {
      const result = getHeading(path, 1, heading)

      expect(result.length()).toBeCloseTo(1)
    })

    it('should hold its heading at the start of the orbit', () => {
      expect(getHeading(path, 0, heading).length()).toBeCloseTo(1)
    })
  })

  describe('getPlumeOrientation()', () => {
    const orientation = new Quaternion()

    /** Location of the given local axis of the oriented plume ends up pointing. */
    const axisOf = (axis: Vector3) => axis.clone().applyQuaternion(orientation)

    it('should lay the tail along the axis it is given', () => {
      const axis = new Vector3(1, 2, 3).normalize()

      getPlumeOrientation(axis, new Vector3(100, 0, 0), new Vector3(0, 500, 0), orientation)

      expect(axisOf(new Vector3(0, 1, 0)).angleTo(axis)).toBeCloseTo(0)
    })

    it('should lay it along that axis wherever the camera watches from', () => {
      const axis = new Vector3(0, 0, 1)

      getPlumeOrientation(axis, new Vector3(-60, 10, 80), new Vector3(-900, 400, 0), orientation)

      expect(axisOf(new Vector3(0, 1, 0)).angleTo(axis)).toBeCloseTo(0)
    })

    it('should turn the face of the plume toward the camera', () => {
      const comet = new Vector3(100, 0, 0)
      const camera = new Vector3(100, 0, 500)

      getPlumeOrientation(new Vector3(0, 1, 0), comet, camera, orientation)

      const toCamera = camera.clone().sub(comet).normalize()

      expect(axisOf(new Vector3(0, 0, 1)).angleTo(toCamera)).toBeCloseTo(0)
    })

    it('should keep the plume square to the camera about its own axis', () => {
      const comet = new Vector3(0, 200, 0)

      getPlumeOrientation(new Vector3(0, 1, 0), comet, new Vector3(300, 200, 0), orientation)

      expect(axisOf(new Vector3(1, 0, 0)).dot(new Vector3(1, 0, 0))).toBeCloseTo(0)
    })

    it('should leave the plume as it was when the camera looks straight down the tail', () => {
      const axis = new Vector3(0, 0, 1)

      expect(
        getPlumeOrientation(axis, new Vector3(0, 0, 100), new Vector3(0, 0, 500), orientation)
      ).toBe(false)
    })
  })
})
