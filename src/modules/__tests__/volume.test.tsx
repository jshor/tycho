import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import Cookies from 'js-cookie'
import { Volume, getVolume, setVolume } from '../volume'

const action = { setVolume: vi.fn() }

describe('Volume Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Cookies.remove('volume')
  })

  describe('getVolume()', () => {
    it('should parse the cookie value as a number', () => {
      Cookies.set('volume', '0')

      expect(getVolume()).toBe(0)
    })

    it('should return 1 when the cookie is not set', () => {
      expect(getVolume()).toBe(1)
    })
  })

  describe('setVolume()', () => {
    it('should store the volume level in a cookie for a year', () => {
      const spy = vi.spyOn(Cookies, 'set')

      setVolume(1)

      expect(spy).toHaveBeenCalledWith('volume', '1', { expires: 365 })
    })
  })

  describe('render()', () => {
    it('should mute the scene when the user muted it on a previous visit', () => {
      Cookies.set('volume', '0')

      renderWithStore(<Volume action={action} volume={1} />)

      expect(action.setVolume).toHaveBeenCalledWith(0)
    })

    it('should leave the volume alone when the user left the scene audible', () => {
      Cookies.set('volume', '1')

      renderWithStore(<Volume action={action} volume={1} />)

      expect(action.setVolume).not.toHaveBeenCalled()
    })

    it('should leave the volume alone while the scene is already muted', () => {
      Cookies.set('volume', '0')

      renderWithStore(<Volume action={action} volume={0} />)

      expect(action.setVolume).not.toHaveBeenCalled()
    })
  })

  describe('triggerVolume()', () => {
    it('should unmute the scene while it is muted', () => {
      Cookies.set('volume', '0')

      const { container } = renderWithStore(<Volume action={action} volume={0} />)

      fireEvent.click(container.querySelector('.volume'))

      expect(Cookies.get('volume')).toEqual('1')
      expect(action.setVolume).toHaveBeenCalledWith(1)
    })

    it('should mute the scene while it is audible', () => {
      Cookies.set('volume', '1')

      const { container } = renderWithStore(<Volume action={action} volume={1} />)

      fireEvent.click(container.querySelector('.volume'))

      expect(Cookies.get('volume')).toEqual('0')
      expect(action.setVolume).toHaveBeenCalledWith(0)
    })
  })
})
