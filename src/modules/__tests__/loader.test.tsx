import { act, fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { DefaultLoadingManager } from 'three'
import { useStore } from '../../store'
import { Loader } from '../loader'
import { Store } from '../../types'

describe('Loader Module', () => {
  const renderModule = (state: Partial<Store> = {}) => renderWithStore(<Loader />, state)

  describe('onProgress()', () => {
    it('should report three.js loading progress to the store', () => {
      renderModule()

      act(() => DefaultLoadingManager.onProgress('tex.png', 2, 4))

      const { percent, url } = useStore.getState()

      expect(percent).toEqual(50)
      expect(url).toEqual('tex.png')
    })
  })

  describe('enterScene()', () => {
    it('should start playing, unmute the scene and dismiss the splash screen', () => {
      const { container } = renderModule({ percent: 100, pageText: { start: 'Start' } })

      expect(container.querySelector('.splash-screen--show')).not.toBeNull()

      fireEvent.click(container.querySelector('.splash-screen__button-anchor'))

      const { playing, volume } = useStore.getState()

      expect(playing).toBe(true)
      expect(volume).toEqual(1)
      expect(container.querySelector('.splash-screen--hide')).not.toBeNull()
    })
  })

  describe('render()', () => {
    it('should default the loading progress to zero', () => {
      const { container } = renderModule()
      const bar = container.querySelector('.splash-screen__loading-bar') as HTMLElement

      expect(bar.style.width).toEqual('0%')
    })

    it('should show how much of the scene has loaded', () => {
      const { container } = renderModule({ percent: 40 })
      const bar = container.querySelector('.splash-screen__loading-bar') as HTMLElement

      expect(bar.style.width).toEqual('40%')
    })
  })
})
