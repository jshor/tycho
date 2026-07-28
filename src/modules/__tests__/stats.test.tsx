import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { useStore } from '../../store'
import { Stats } from '../stats'
import { OrbitalService } from '../../services/OrbitalService'
import { Constants } from '../../constants'
import moment from 'moment'
import data from './__fixtures__/orbitals.json'
import { OrbitalData, Store } from '../../types'

const orbitalData = data as OrbitalData[]

const baseState = { orbitalData, pageText: {}, time: 1 }

const stats = {
  magnitude: '1AU',
  velocity: '10km/s',
  trueAnomaly: '45°'
}

describe('Stats Module', () => {
  beforeEach(() => {
    vi.spyOn(OrbitalService, 'getOrbitalStats').mockReturnValue(stats)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<Stats />, { ...baseState, ...state })
  }

  describe('render()', () => {
    it('should report the stats of the active orbital', () => {
      const { container } = renderModule({ targetId: 'dummyParent' })
      const text = container.textContent

      expect(text).toContain(stats.velocity)
      expect(text).toContain(stats.magnitude)
      expect(text).toContain(stats.trueAnomaly)
    })

    it('should report no stats while no orbital is active', () => {
      const { container } = renderModule()

      expect(OrbitalService.getOrbitalStats).not.toHaveBeenCalled()
      expect(container.textContent).not.toContain(stats.velocity)
    })

    it('should display the current simulation time', () => {
      const { container } = renderModule({ time: 1000 })

      expect(container.textContent).toContain(
        moment(1000 * 1000).format(Constants.UI.UX_DATE_FORMAT)
      )
    })
  })

  describe('updateOrbitalStats()', () => {
    it('should recompute the stats as the clock ticks', () => {
      renderModule({ targetId: 'dummyParent' })

      act(() => useStore.setState({ time: 2 }))

      expect(OrbitalService.getOrbitalStats).toHaveBeenCalledTimes(2)
      expect(OrbitalService.getOrbitalStats).toHaveBeenLastCalledWith(expect.anything(), 2)
    })

    it('should recompute the stats when the active orbital changes', () => {
      renderModule({ targetId: 'dummyParent' })

      act(() => useStore.setState({ targetId: 'dummyOuter' }))

      expect(OrbitalService.getOrbitalStats).toHaveBeenCalledTimes(2)
    })

    it('should not recompute the stats when nothing has changed', () => {
      renderModule({ targetId: 'dummyParent' })

      act(() => useStore.setState({ targetId: 'dummyParent' }))

      expect(OrbitalService.getOrbitalStats).toHaveBeenCalledTimes(1)
    })
  })
})
