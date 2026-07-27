import React from 'react'
import { renderWithStore } from '../../test/render'
import { UIControlsContainer } from '../UIControlsContainer'
import { Mutable } from '../../test/helpers'

const action = {
  setUIControls: vi.fn(),
  toggleModal: vi.fn(),
  toggleSettings: vi.fn()
}

describe('UI Controls Container', () => {
  let ref: React.RefObject<UIControlsContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<UIControlsContainer>()
    renderWithStore(<UIControlsContainer action={action} ref={ref} />)
  })

  describe('toggleSettings()', () => {
    it('should call toggleSettings with the inverse of settingsActive', () => {
      const current = ref.current as Mutable<UIControlsContainer>
      const toggleSettings = vi.fn()
      current.props = {
        action: { ...action, toggleSettings },
        settingsActive: false
      }

      current.toggleSettings()

      expect(toggleSettings).toHaveBeenCalledWith(true)
    })
  })

  describe('openModal()', () => {
    it('should open the modal and hide UI controls', () => {
      const current = ref.current as Mutable<UIControlsContainer>
      const toggleModal = vi.fn()
      const setUIControls = vi.fn()
      current.props = {
        action: { ...action, toggleModal, setUIControls }
      }

      current.openModal('TEST_MODAL')

      expect(toggleModal).toHaveBeenCalledWith('TEST_MODAL')
      expect(setUIControls).toHaveBeenCalledWith(false)
    })
  })
})
