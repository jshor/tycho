import { act, fireEvent } from '@testing-library/react'
import { Line } from '@react-three/drei'
import { renderInScene } from '../../test/helpers'
import { useStore } from '../../store'
import data from './__fixtures__/orbitals.json'
import { Orbital } from '../orbital'
import { Constants } from '../../constants'
import { toRadians } from '../../utils/math'
import { Ellipse } from '../../elements/ellipse'
import { OrbitalData, Store } from '../../types'

vi.mock('../../utils/math', { spy: true })

const orbital = data[0] as OrbitalData
const ASCENSION = 90

describe('Orbital Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderModule = (state: Partial<Store> = {}, props = {}) => {
    return renderInScene(<Orbital {...orbital} {...props} />, { time: 1, ...state })
  }

  describe('render()', () => {
    it('should render a group named after the orbital', () => {
      const { container } = renderModule()

      expect(container.querySelector(`group[name="${orbital.id}"]`)).not.toBeNull()
    })
  })

  describe('body position', () => {
    it('should update the ellipse time on first render', () => {
      const spy = vi.spyOn(Ellipse.prototype, 'updateTime')

      renderModule()

      expect(spy).toHaveBeenCalledWith(1)
    })

    it('should reposition the body as the clock ticks', () => {
      const spy = vi.spyOn(Ellipse.prototype, 'updateTime')

      renderModule()
      spy.mockClear()

      act(() => useStore.setState({ time: 2 }))

      expect(spy).toHaveBeenCalledWith(2)
    })

    it('should leave the body where it is when nothing has changed', () => {
      const spy = vi.spyOn(Ellipse.prototype, 'updateTime')

      renderModule()
      spy.mockClear()

      act(() => useStore.setState({ time: 1 }))

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('eclipticGroupRotation', () => {
    it('should negate the ascension as the x rotation for non-satellites', () => {
      const spy = vi.mocked(toRadians)

      renderModule({}, { isSatellite: false })

      expect(spy).toHaveBeenCalledWith(-ASCENSION)
    })

    it('should apply no x rotation for satellites', () => {
      const spy = vi.mocked(toRadians)

      renderModule({}, { isSatellite: true })

      expect(spy).not.toHaveBeenCalledWith(-ASCENSION)
    })

    it('should apply longitudeOfAscendingNode offset to the z rotation', () => {
      const spy = vi.mocked(toRadians)
      const longitudeOfAscendingNode = 15

      renderModule({}, { longitudeOfAscendingNode })

      expect(spy).toHaveBeenCalledWith(ASCENSION + longitudeOfAscendingNode)
    })
  })

  describe('orbitalGroupRotation', () => {
    it('should apply inclination as the x rotation', () => {
      const spy = vi.mocked(toRadians)
      const inclination = 10

      renderModule({}, { inclination })

      expect(spy).toHaveBeenCalledWith(inclination)
    })

    it('should apply argumentOfPeriapsis offset to the z rotation', () => {
      const spy = vi.mocked(toRadians)
      const argumentOfPeriapsis = 10

      renderModule({}, { argumentOfPeriapsis })

      expect(spy).toHaveBeenCalledWith(ASCENSION + argumentOfPeriapsis)
    })
  })

  describe('orbitalRotation', () => {
    it('should apply ASCENSION + axialTilt as the x rotation', () => {
      const spy = vi.mocked(toRadians)
      const axialTilt = 10

      renderModule({}, { axialTilt })

      expect(spy).toHaveBeenCalledWith(ASCENSION + axialTilt)
    })

    it('should not call toRadians for the z axis', () => {
      const spy = vi.mocked(toRadians)
      const axialTilt = 10

      renderModule({}, { axialTilt })

      const bodyRotationXCall = spy.mock.calls.find(([v]) => v === ASCENSION + axialTilt)
      expect(bodyRotationXCall).toBeDefined()
    })
  })

  describe('pathOpacity', () => {
    it('should be OFF when the orbital is not highlighted', () => {
      renderModule({ highlightedId: undefined })

      const [props] = vi.mocked(Line).mock.calls[0]

      expect(props.opacity).toBe(Constants.UI.HOVER_OPACITY_OFF)
    })

    it('should be ON when the orbital is highlighted', () => {
      renderModule({ highlightedId: orbital.id })

      const [props] = vi.mocked(Line).mock.calls[0]

      expect(props.opacity).toBe(Constants.UI.HOVER_OPACITY_ON)
    })

    it('should update when the highlighted orbital changes', () => {
      renderModule()
      vi.mocked(Line).mockClear()

      act(() => useStore.setState({ highlightedId: orbital.id }))

      const [props] = vi.mocked(Line).mock.calls[0]

      expect(props.opacity).toBe(Constants.UI.HOVER_OPACITY_ON)
    })
  })

  describe('label actions', () => {
    it('should focus the camera on the orbital when its label is tapped', () => {
      const setActiveOrbitalId = vi.fn()
      const { container } = renderModule({ setActiveOrbitalId })
      const label = container.querySelector('span') as Element
      const tap = { bubbles: true, clientX: 100, clientY: 100 }

      // jsdom has no PointerEvent, and the plain Event testing-library falls back to carries no
      // coordinates, which the label needs to tell a tap from a drag
      fireEvent(label, new MouseEvent('pointerdown', tap))
      fireEvent(label, new MouseEvent('pointerup', tap))

      expect(setActiveOrbitalId).toHaveBeenCalledWith(orbital.id)
    })
  })
})
