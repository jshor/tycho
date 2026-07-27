import { render } from '@testing-library/react'
import { Stats } from '../stats'
import OrbitalService from '../../services/OrbitalService'
import Constants from '../../constants'
import moment from 'moment'
import data from './__fixtures__/orbitals.json'

const baseProps = { orbitalData: data, pageText: {}, time: 1 }

const stats = {
  magnitude: '1AU',
  velocity: '10km/s',
  trueAnomaly: '45°'
}

describe('Stats Module', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(OrbitalService, 'getOrbitalStats').mockReturnValue(stats)
  })

  describe('render()', () => {
    it('should report the stats of the active orbital', () => {
      const { container } = render(<Stats {...baseProps} targetId="dummyParent" />)
      const text = container.textContent

      expect(text).toContain(stats.velocity)
      expect(text).toContain(stats.magnitude)
      expect(text).toContain(stats.trueAnomaly)
    })

    it('should report no stats while no orbital is active', () => {
      const { container } = render(<Stats {...baseProps} />)

      expect(OrbitalService.getOrbitalStats).not.toHaveBeenCalled()
      expect(container.textContent).not.toContain(stats.velocity)
    })

    it('should display the current simulation time', () => {
      const { container } = render(<Stats {...baseProps} time={1000} />)

      expect(container.textContent).toContain(
        moment(1000 * 1000).format(Constants.UI.UX_DATE_FORMAT)
      )
    })
  })

  describe('updateOrbitalStats()', () => {
    it('should recompute the stats as the clock ticks', () => {
      const { rerender } = render(<Stats {...baseProps} targetId="dummyParent" />)

      rerender(<Stats {...baseProps} targetId="dummyParent" time={2} />)

      expect(OrbitalService.getOrbitalStats).toHaveBeenCalledTimes(2)
      expect(OrbitalService.getOrbitalStats).toHaveBeenLastCalledWith(expect.anything(), 2)
    })

    it('should recompute the stats when the active orbital changes', () => {
      const { rerender } = render(<Stats {...baseProps} targetId="dummyParent" />)

      rerender(<Stats {...baseProps} targetId="dummyOuter" />)

      expect(OrbitalService.getOrbitalStats).toHaveBeenCalledTimes(2)
    })

    it('should not recompute the stats when nothing has changed', () => {
      const { rerender } = render(<Stats {...baseProps} targetId="dummyParent" />)

      rerender(<Stats {...baseProps} targetId="dummyParent" />)

      expect(OrbitalService.getOrbitalStats).toHaveBeenCalledTimes(1)
    })
  })
})
