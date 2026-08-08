import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { Stats } from '../stats'
import { PhysicsService } from '../../services/PhysicsService'
import { formatUnixTime } from '../../utils/DateTime'
import data from './__fixtures__/orbitals.json'
import { OrbitalData, Store } from '../../types'

const orbitalData = data as OrbitalData[]

/** The orbital the camera is watching, which the store hands over alongside its ID. */
const target = { ...orbitalData[1], description: 'The third rock from the sun.' }

/** The orbital the camera turns to next. */
const other = orbitalData[0]

const baseState = { orbitalData, pageText: {}, time: 1 }

describe('Stats Module', () => {
  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<Stats />, { ...baseState, ...state })
  }

  /** Renders the readout of an orbital whose statistics work out to the given figures. */
  const renderReadout = (distance: number, trueAnomaly: number, energy: number) => {
    vi.spyOn(PhysicsService, 'getDistanceFromAttractingBody').mockReturnValue({
      distance,
      trueAnomaly
    })
    vi.spyOn(PhysicsService, 'orbitalEnergyConservation').mockReturnValue(energy)

    return renderModule({ targetId: target.id, target })
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('render()', () => {
    it('should report the statistics of the orbital the camera is focused on', () => {
      const { container } = renderReadout(149598261.4567, 45.6789, 29.7859)
      const text = container.textContent

      expect(text).toContain('149,598,261.457')
      expect(text).toContain('45.679')
      expect(text).toContain('29.786')
    })

    it('should read the statistics off the orbital at the moment the clock stands at', () => {
      renderReadout(1, 2, 3)

      expect(PhysicsService.getDistanceFromAttractingBody).toHaveBeenCalledWith(
        target.eccentricity,
        1,
        target.periapses,
        target.semimajor
      )
    })

    it('should describe the orbital the camera is focused on', () => {
      const { container } = renderModule({ targetId: target.id, target })

      expect(container.querySelector('.stats__description')?.textContent).toContain(
        target.description
      )
    })

    it('should report no statistics while the camera is focused on nothing', () => {
      const { container } = renderModule()

      expect(container.textContent).toContain('N/A')
      expect(container.querySelector('.stats__description')?.textContent).toEqual('')
    })

    it('should display the current simulation time', () => {
      const { container } = renderModule({ time: 1000 })

      expect(container.textContent).toContain(formatUnixTime(1000))
    })
  })

  describe('as the scene moves on', () => {
    it('should read the statistics out anew as the clock ticks', () => {
      const { container } = renderModule({ targetId: target.id, target })
      const before = container.textContent

      act(() => useStore.setState({ time: 20000000 }))

      expect(container.textContent).not.toEqual(before)
    })

    it('should read out the statistics of whichever orbital the camera turns to', () => {
      const { container } = renderModule({ targetId: target.id, target })
      const before = container.textContent

      act(() => useStore.setState({ targetId: other.id, target: other }))

      expect(container.textContent).not.toEqual(before)
    })

    it('should leave the readout as it is while nothing has moved', () => {
      const { container } = renderModule({ targetId: target.id, target })
      const before = container.textContent

      act(() => useStore.setState({ zoom: 50 }))

      expect(container.textContent).toEqual(before)
    })
  })
})
