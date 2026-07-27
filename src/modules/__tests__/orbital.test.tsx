import { Vector3 } from 'three'
import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import useStore from '../../store'
import data from './__fixtures__/orbitals.json'
import Orbital from '../orbital'
import OrbitalService from '../../services/OrbitalService'
import Constants from '../../constants'
import { OrbitalData, Store } from '../../types'

const orbital = data[0] as OrbitalData

describe('Orbital Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderModule = (state: Partial<Store> = {}, props = {}) => {
    return renderWithStore(<Orbital {...orbital} {...props} />, { time: 1, ...state })
  }

  describe('render()', () => {
    it('should render a group named after the orbital', () => {
      const { container } = renderModule()

      expect(container.querySelector(`group[name="${orbital.id}"]`)).not.toBeNull()
    })

    it('should position the body along its orbit at the current time', () => {
      const position = new Vector3(1, 2, 3)
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition').mockReturnValue(position)

      renderModule()

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('body state', () => {
    it('should reposition the body as the clock ticks', () => {
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition')

      renderModule()
      spy.mockClear()

      act(() => useStore.setState({ time: 2 }))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should leave the body where it is when nothing has changed', () => {
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition')

      renderModule()
      spy.mockClear()

      act(() => useStore.setState({ time: 1 }))

      expect(spy).not.toHaveBeenCalled()
    })

    it('should reposition the body when the scale changes', () => {
      const spy = vi.spyOn(OrbitalService, 'getBodyPosition')

      renderModule({ scale: 1 })
      spy.mockClear()

      act(() => useStore.setState({ scale: 2 }))

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('scale', () => {
    it("should rescale a satellite's orbit when the scale changes", () => {
      const spy = vi.spyOn(OrbitalService, 'getMaxViewDistance')

      renderModule({ scale: 1 }, { isSatellite: true })
      spy.mockClear()

      act(() => useStore.setState({ scale: 2 }))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should rebuild the orbit path when the scale changes', () => {
      const { container } = renderModule({ scale: 1 }, { isSatellite: true })
      const before = container.innerHTML

      act(() => useStore.setState({ scale: 2 }))

      expect(container.innerHTML).not.toEqual(before)
    })
  })

  describe('pathOpacity', () => {
    it('should recompute the path opacity when the highlighted orbitals change', () => {
      const spy = vi
        .spyOn(OrbitalService, 'getPathOpacity')
        .mockReturnValue(Constants.UI.HOVER_OPACITY_ON)

      renderModule({ highlightedOrbitals: [] })
      spy.mockClear()

      act(() => useStore.setState({ highlightedOrbitals: [orbital.id] }))

      expect(spy).toHaveBeenCalledWith(expect.anything(), [orbital.id], false)
    })

    it('should mark the orbital as the target when the camera is focused on it', () => {
      const spy = vi.spyOn(OrbitalService, 'getPathOpacity')

      renderModule({ targetId: orbital.id })

      expect(spy).toHaveBeenCalledWith(expect.anything(), undefined, true)
    })
  })

  describe('label actions', () => {
    it('should focus the camera on the orbital when its label is clicked', () => {
      const setActiveOrbital = vi.fn()
      const { container } = renderModule({ setActiveOrbital })

      container.querySelector('span')?.click()

      expect(setActiveOrbital).toHaveBeenCalledWith(orbital.id, orbital.name)
    })
  })
})
