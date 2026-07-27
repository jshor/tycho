import React from 'react'
import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { DefaultLoadingManager } from 'three'
import { LoaderContainer } from '../LoaderContainer'
import { Mutable } from '../../test/helpers'

const action = {
  setPercentLoaded: vi.fn(),
  setTextureLoaded: vi.fn(),
  setPlaying: vi.fn(),
  setVolume: vi.fn()
}

describe('Loader Container', () => {
  let ref: React.RefObject<LoaderContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<LoaderContainer>()
    renderWithStore(<LoaderContainer action={action} ref={ref} />)
  })

  describe('componentDidMount()', () => {
    it('should register a progress handler on DefaultLoadingManager', () => {
      expect(DefaultLoadingManager.onProgress).toBe(ref.current?.onProgress)
    })
  })

  describe('onProgress()', () => {
    it('should dispatch setPercentLoaded and setTextureLoaded', () => {
      const current = ref.current as Mutable<LoaderContainer>
      current.props = { action }
      current.onProgress('tex.png', 2, 4)

      expect(action.setPercentLoaded).toHaveBeenCalledWith(2, 4)
      expect(action.setTextureLoaded).toHaveBeenCalledWith('tex.png')
    })
  })

  describe('enterScene()', () => {
    it('should start playing and set volume to 1', () => {
      const current = ref.current as Mutable<LoaderContainer>

      current.props = { action }
      current.enterScene()

      expect(action.setPlaying).toHaveBeenCalledWith(true)
      expect(action.setVolume).toHaveBeenCalledWith(1)
    })

    it('should set hasEntered state to true', () => {
      const current = ref.current as Mutable<LoaderContainer>

      current.props = { action }
      act(() => {
        current.enterScene()
      })

      expect(ref.current.state.hasEntered).toBe(true)
    })
  })
})
