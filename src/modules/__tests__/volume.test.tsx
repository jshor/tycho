import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import useStore from '../../store'
import Volume, { getVolume, setVolume } from '../volume'

describe('Volume Module', () => {
  beforeEach(() => {
    localStorage.removeItem('volume')
  })

  describe('getVolume()', () => {
    it('should parse the localStorage value as a number', () => {
      localStorage.setItem('volume', '0')

      expect(getVolume()).toBe(0)
    })

    it('should return 1 when the localStorage is not set', () => {
      expect(getVolume()).toBe(1)
    })
  })

  describe('setVolume()', () => {
    it.skip('should store the volume level in localStorage', () => {
      const spy = vi.spyOn(localStorage, 'setItem')

      setVolume(1)

      expect(spy).toHaveBeenCalledWith('volume', '1')
    })
  })

  describe('render()', () => {
    it('should mute the scene when the user muted it on a previous visit', () => {
      localStorage.setItem('volume', '0')

      renderWithStore(<Volume />, { volume: 1 })

      expect(useStore.getState().volume).toEqual(0)
    })

    it('should leave the volume alone when the user left the scene audible', () => {
      localStorage.setItem('volume', '1')

      renderWithStore(<Volume />, { volume: 1 })

      expect(useStore.getState().volume).toEqual(1)
    })

    it('should leave the volume alone while the scene is already muted', () => {
      localStorage.setItem('volume', '0')

      renderWithStore(<Volume />, { volume: 0 })

      expect(useStore.getState().volume).toEqual(0)
    })
  })

  describe('triggerVolume()', () => {
    it('should unmute the scene while it is muted', () => {
      localStorage.setItem('volume', '0')

      const { container } = renderWithStore(<Volume />, { volume: 0 })

      fireEvent.click(container.querySelector('.volume'))

      expect(localStorage.getItem('volume')).toEqual('1')
      expect(useStore.getState().volume).toEqual(1)
    })

    it('should mute the scene while it is audible', () => {
      localStorage.setItem('volume', '1')

      const { container } = renderWithStore(<Volume />, { volume: 1 })

      fireEvent.click(container.querySelector('.volume'))

      expect(localStorage.getItem('volume')).toEqual('0')
      expect(useStore.getState().volume).toEqual(0)
    })
  })
})
