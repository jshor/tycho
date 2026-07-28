import { Vector3 } from 'three'
import { act, fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { useStore } from '../../store'
import data from './__fixtures__/orbitals.json'
import { Orbital } from '../orbital'
import { OrbitalService } from '../../services/OrbitalService'
import { Constants } from '../../constants'
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
    it('should focus the camera on the orbital when its label is tapped', () => {
      const setActiveOrbital = vi.fn()
      const { container } = renderModule({ setActiveOrbital })
      const label = container.querySelector('span') as Element
      const tap = { bubbles: true, clientX: 100, clientY: 100 }

      // jsdom has no PointerEvent, and the plain Event testing-library falls back to carries no
      // coordinates, which the label needs to tell a tap from a drag
      fireEvent(label, new MouseEvent('pointerdown', tap))
      fireEvent(label, new MouseEvent('pointerup', tap))

      expect(setActiveOrbital).toHaveBeenCalledWith(orbital.id, orbital.name)
    })
  })
})
