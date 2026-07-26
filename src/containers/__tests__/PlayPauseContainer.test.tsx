import React from 'react'
import { render } from '@testing-library/react'
import { PlayPauseContainer } from '../PlayPauseContainer'

describe('Play Pause Container', () => {
  let ref: React.RefObject<PlayPauseContainer>

  beforeEach(() => {
    ref = React.createRef<PlayPauseContainer>()
    render(<PlayPauseContainer ref={ref as any} />)
  })

  describe('togglePlayer()', () => {
    it('should call setPlaying with the inverse of the current playing value', () => {
      const setPlaying = vi.fn()
      ;(ref.current! as any).props = { action: { setPlaying }, playing: true }

      ref.current!.togglePlayer()

      expect(setPlaying).toHaveBeenCalledWith(false)
    })
  })
})
