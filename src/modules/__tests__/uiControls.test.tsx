import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { UIControls, Props } from '../uiControls'
import Constants from '../../constants'

const action = {
  setUIControls: vi.fn(),
  toggleModal: vi.fn(),
  toggleSettings: vi.fn()
}

describe('UI Controls Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModule = (props: Partial<Props> = {}) => {
    return renderWithStore(<UIControls action={action} pageText={{}} {...props} />)
  }

  describe('toggleSettings()', () => {
    it('should expand the settings panel while it is collapsed', () => {
      const { container } = renderModule({ settingsActive: false })

      fireEvent.click(container.querySelector('.settings-panel__hamburger'))

      expect(action.toggleSettings).toHaveBeenCalledWith(true)
    })

    it('should collapse the settings panel while it is expanded', () => {
      const { container } = renderModule({ settingsActive: true })

      fireEvent.click(container.querySelector('.settings-panel__hamburger'))

      expect(action.toggleSettings).toHaveBeenCalledWith(false)
    })
  })

  describe('openModal()', () => {
    it('should open the stats modal and hide the UI controls', () => {
      const { container } = renderModule({ targetName: 'Earth' })

      fireEvent.click(container.querySelector('.uicontrols__control--stats-modal'))

      expect(action.toggleModal).toHaveBeenCalledWith(Constants.UI.ModalTypes.STATS_MODAL)
      expect(action.setUIControls).toHaveBeenCalledWith(false)
    })

    it('should open the about modal and hide the UI controls', () => {
      const { container } = renderModule()

      fireEvent.click(container.querySelector('.uicontrols__button--about-modal'))

      expect(action.toggleModal).toHaveBeenCalledWith(Constants.UI.ModalTypes.ABOUT_MODAL)
      expect(action.setUIControls).toHaveBeenCalledWith(false)
    })
  })
})
