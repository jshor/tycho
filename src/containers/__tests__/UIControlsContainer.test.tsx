import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { UIControlsContainer, Props } from '../UIControlsContainer'
import Constants from '../../constants'

const action = {
  setUIControls: vi.fn(),
  toggleModal: vi.fn(),
  toggleSettings: vi.fn()
}

describe('UI Controls Container', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderContainer = (props: Partial<Props> = {}) => {
    return renderWithStore(<UIControlsContainer action={action} pageText={{}} {...props} />)
  }

  describe('toggleSettings()', () => {
    it('should expand the settings panel while it is collapsed', () => {
      const { container } = renderContainer({ settingsActive: false })

      fireEvent.click(container.querySelector('.settings-panel__hamburger'))

      expect(action.toggleSettings).toHaveBeenCalledWith(true)
    })

    it('should collapse the settings panel while it is expanded', () => {
      const { container } = renderContainer({ settingsActive: true })

      fireEvent.click(container.querySelector('.settings-panel__hamburger'))

      expect(action.toggleSettings).toHaveBeenCalledWith(false)
    })
  })

  describe('openModal()', () => {
    it('should open the stats modal and hide the UI controls', () => {
      const { container } = renderContainer({ targetName: 'Earth' })

      fireEvent.click(container.querySelector('.uicontrols__control--stats-modal'))

      expect(action.toggleModal).toHaveBeenCalledWith(Constants.UI.ModalTypes.STATS_MODAL)
      expect(action.setUIControls).toHaveBeenCalledWith(false)
    })

    it('should open the about modal and hide the UI controls', () => {
      const { container } = renderContainer()

      fireEvent.click(container.querySelector('.uicontrols__button--about-modal'))

      expect(action.toggleModal).toHaveBeenCalledWith(Constants.UI.ModalTypes.ABOUT_MODAL)
      expect(action.setUIControls).toHaveBeenCalledWith(false)
    })
  })
})
