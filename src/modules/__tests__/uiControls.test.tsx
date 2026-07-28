import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { useStore } from '../../store'
import { UIControls } from '../uiControls'
import { Constants } from '../../constants'
import { Store } from '../../types'

describe('UI Controls Module', () => {
  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<UIControls />, state)
  }

  describe('openModal()', () => {
    it('should open the stats modal and hide the UI controls', () => {
      const { container } = renderModule({ targetName: 'Earth', controlsEnabled: true })

      fireEvent.click(container.querySelector('.uicontrols__control--stats-modal'))

      const { activeModal, controlsEnabled } = useStore.getState()

      expect(activeModal).toEqual(Constants.UI.ModalTypes.STATS_MODAL)
      expect(controlsEnabled).toBe(false)
    })

    it('should open the about modal and hide the UI controls', () => {
      const { container } = renderModule({ controlsEnabled: true })

      fireEvent.click(container.querySelector('.uicontrols__button--about-modal'))

      const { activeModal, controlsEnabled } = useStore.getState()

      expect(activeModal).toEqual(Constants.UI.ModalTypes.ABOUT_MODAL)
      expect(controlsEnabled).toBe(false)
    })
  })

  describe('render()', () => {
    it('should name the orbital the camera is focused on', () => {
      const { container } = renderModule({ targetName: 'Earth' })

      expect(container.querySelector('.uicontrols__control--stats-modal')?.textContent).toEqual(
        'Earth'
      )
    })

    it('should zoom the camera as the zoom slider moves', () => {
      renderModule({ zoom: 50 })
      useStore.getState().changeZoom(25)

      expect(useStore.getState().zoom).toEqual(25)
    })
  })
})
