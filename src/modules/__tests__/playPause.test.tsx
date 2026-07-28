import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { useStore } from '../../store'
import { PlayPause } from '../playPause'

describe('Play Pause Module', () => {
  describe('togglePlayer()', () => {
    it('should pause the simulation while it is playing', () => {
      const { container } = renderWithStore(<PlayPause />, { playing: true })

      fireEvent.click(container.querySelector('.play-pause'))

      expect(useStore.getState().playing).toBe(false)
    })

    it('should play the simulation while it is paused', () => {
      const { container } = renderWithStore(<PlayPause />, { playing: false })

      fireEvent.click(container.querySelector('.play-pause'))

      expect(useStore.getState().playing).toBe(true)
    })
  })
})
