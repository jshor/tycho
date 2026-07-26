import React from 'react'
import { render } from '@testing-library/react'
import { UIControlsContainer } from '../UIControlsContainer'

describe('UI Controls Container', () => {
  let ref: React.RefObject<UIControlsContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<UIControlsContainer>()
    render(<UIControlsContainer action={{ changeSpeed: vi.fn() } as any} ref={ref as any} />)
  })

  describe('toggleSettings()', () => {
    it('should call toggleSettings with the inverse of settingsActive', () => {
      const toggleSettings = vi.fn()
      ;(ref.current! as any).props = { action: { toggleSettings }, settingsActive: false }

      ref.current!.toggleSettings()

      expect(toggleSettings).toHaveBeenCalledWith(true)
    })
  })

  describe('openModal()', () => {
    it('should open the modal and hide UI controls', () => {
      const toggleModal = vi.fn()
      const setUIControls = vi.fn()
      ;(ref.current! as any).props = { action: { toggleModal, setUIControls } }

      ref.current!.openModal('TEST_MODAL')

      expect(toggleModal).toHaveBeenCalledWith('TEST_MODAL')
      expect(setUIControls).toHaveBeenCalledWith(false)
    })
  })
})
