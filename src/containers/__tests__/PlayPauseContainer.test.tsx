import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { PlayPauseContainer } from '../PlayPauseContainer'

const action = { setPlaying: vi.fn() }

describe('Play Pause Container', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('togglePlayer()', () => {
    it('should pause the simulation while it is playing', () => {
      const { container } = renderWithStore(<PlayPauseContainer action={action} playing />)

      fireEvent.click(container.querySelector('.play-pause'))

      expect(action.setPlaying).toHaveBeenCalledWith(false)
    })

    it('should play the simulation while it is paused', () => {
      const { container } = renderWithStore(<PlayPauseContainer action={action} playing={false} />)

      fireEvent.click(container.querySelector('.play-pause'))

      expect(action.setPlaying).toHaveBeenCalledWith(true)
    })
  })
})
