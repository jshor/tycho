import React from 'react'
import { renderWithStore } from '../../test/render'
import { PlayPauseContainer } from '../PlayPauseContainer'
import { Mutable } from '../../test/helpers'

describe('Play Pause Container', () => {
  let ref: React.RefObject<PlayPauseContainer>

  beforeEach(() => {
    ref = React.createRef<PlayPauseContainer>()
    renderWithStore(<PlayPauseContainer ref={ref} />)
  })

  describe('togglePlayer()', () => {
    it('should call setPlaying with the inverse of the current playing value', () => {
      const current = ref.current as Mutable<PlayPauseContainer>
      const setPlaying = vi.fn()
      current.props = {
        action: { setPlaying },
        playing: true
      }

      current.togglePlayer()

      expect(setPlaying).toHaveBeenCalledWith(false)
    })
  })
})
