import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { DefaultLoadingManager } from 'three'
import { Loader } from '../loader'

const action = {
  setPercentLoaded: vi.fn(),
  setTextureLoaded: vi.fn(),
  setPlaying: vi.fn(),
  setVolume: vi.fn()
}

describe('Loader Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('onProgress()', () => {
    it('should report three.js loading progress to the store', () => {
      renderWithStore(<Loader action={action} />)

      DefaultLoadingManager.onProgress('tex.png', 2, 4)

      expect(action.setPercentLoaded).toHaveBeenCalledWith(2, 4)
      expect(action.setTextureLoaded).toHaveBeenCalledWith('tex.png')
    })
  })

  describe('enterScene()', () => {
    it('should start playing, unmute the scene and dismiss the splash screen', () => {
      const { container } = renderWithStore(
        <Loader action={action} percent={100} pageText={{ start: 'Start' }} />
      )

      expect(container.querySelector('.splash-screen--show')).not.toBeNull()

      fireEvent.click(container.querySelector('.splash-screen__button-anchor'))

      expect(action.setPlaying).toHaveBeenCalledWith(true)
      expect(action.setVolume).toHaveBeenCalledWith(1)
      expect(container.querySelector('.splash-screen--hide')).not.toBeNull()
    })
  })

  describe('render()', () => {
    it('should default the loading progress to zero', () => {
      const { container } = renderWithStore(<Loader action={action} />)
      const bar = container.querySelector('.splash-screen__loading-bar') as HTMLElement

      expect(bar.style.width).toEqual('0%')
    })
  })
})
