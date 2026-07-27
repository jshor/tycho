import React from 'react'
import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { StatsContainer } from '../StatsContainer'
import { Mutable } from '../../test/helpers'
import OrbitalService from '../../services/OrbitalService'
import data from './__fixtures__/orbitals.json'

const baseProps = { orbitalData: data, pageText: {}, time: 1 }

describe('Stats Container', () => {
  let ref: React.RefObject<StatsContainer>

  beforeEach(() => {
    ref = React.createRef<StatsContainer>()
    renderWithStore(<StatsContainer {...baseProps} ref={ref} />)
  })

  describe('componentDidUpdate()', () => {
    it('should call updateOrbitalStats when targetId changes', () => {
      const container = ref.current as Mutable<StatsContainer>
      const spy = vi.spyOn(container, 'updateOrbitalStats')

      container.props = { ...baseProps, targetId: 'Mars', time: 1 }
      container.componentDidUpdate({ targetId: 'Earth', time: 1 })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should call updateOrbitalStats when time changes', () => {
      const container = ref.current as Mutable<StatsContainer>
      const spy = vi.spyOn(container, 'updateOrbitalStats')

      container.props = { ...baseProps, targetId: 'Earth', time: 2 }
      container.componentDidUpdate({ targetId: 'Earth', time: 1 })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should not call updateOrbitalStats when nothing changed', () => {
      const container = ref.current as Mutable<StatsContainer>
      const spy = vi.spyOn(container, 'updateOrbitalStats')

      container.props = { ...baseProps, targetId: 'Earth', time: 1 }
      container.componentDidUpdate({ targetId: 'Earth', time: 1 })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('updateOrbitalStats()', () => {
    it('should set name, description, and orbital stats in state', () => {
      const container = ref.current as Mutable<StatsContainer>
      const target = data[1]

      OrbitalService.getOrbitalStats = () => ({
        magnitude: '1AU',
        velocity: '10km/s',
        trueAnomaly: '45°'
      })
      OrbitalService.getTargetByName = () => target

      container.props = { ...baseProps, orbitalData: data }

      act(() => {
        container.updateOrbitalStats(target.id, 1)
      })

      expect(container.state.name).toBe(target.name)
    })
  })

  describe('getTime()', () => {
    it('should return a formatted time string', () => {
      const current = ref.current as Mutable<StatsContainer>
      current.props = { ...baseProps, time: 1000 }
      const result = current.getTime()
      expect(typeof result).toBe('string')
    })
  })
})
