import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/helpers'
import { useStore } from '../../store'
import { Modal } from '../modal'
import { Constants } from '../../constants'
import { OrbitalData, Store } from '../../types'

/** The key code that dismisses an open modal. */
const ESCAPE = 27

describe('Modal Module', () => {
  const renderModule = (state: Partial<Store> = {}) => {
    return renderWithStore(<Modal type="TEST_MODAL" />, state)
  }

  describe('isModalActive()', () => {
    it('should open the modal when the active modal is its own type', () => {
      const { container } = renderModule({ activeModal: 'TEST_MODAL' })

      expect(container.querySelector('.modal--open')).not.toBeNull()
    })

    it('should close the modal when another modal is active', () => {
      const { container } = renderModule({ activeModal: 'OTHER_MODAL' })

      expect(container.querySelector('.modal--closed')).not.toBeNull()
    })
  })

  describe('title', () => {
    it('should title the stats modal after the orbital the camera is focused on', () => {
      const { container } = renderWithStore(<Modal type={Constants.UI.ModalTypes.STATS_MODAL} />, {
        targetName: 'Earth'
      })

      expect(container.querySelector('.modal__header')?.textContent).toContain('Earth')
    })

    it('should wear the sign of the orbital alongside its name', () => {
      const { container } = renderWithStore(<Modal type={Constants.UI.ModalTypes.STATS_MODAL} />, {
        targetId: 'mars',
        targetName: 'Mars',
        target: { id: 'mars', name: 'Mars', symbol: '2642' } as OrbitalData
      })

      expect(container.querySelector('.modal__header .orbital-symbol')?.textContent).toEqual('♂')
    })

    it('should leave the about modal without a sign, having no body to wear one for', () => {
      const { container } = renderWithStore(<Modal type={Constants.UI.ModalTypes.ABOUT_MODAL} />, {
        targetId: 'mars',
        pageText: { aboutTitle: 'About Tycho' },
        target: { id: 'mars', name: 'Mars', symbol: '2642' } as OrbitalData
      })

      expect(container.querySelector('.orbital-symbol')).toBeNull()
    })

    it('should title the about modal after the page text', () => {
      const { container } = renderWithStore(<Modal type={Constants.UI.ModalTypes.ABOUT_MODAL} />, {
        pageText: { aboutTitle: 'About Tycho' }
      })

      expect(container.querySelector('.modal__header')?.textContent).toContain('About Tycho')
    })
  })

  describe('closeModal()', () => {
    it('should close the modal and re-enable the UI controls', () => {
      const { container } = renderModule({ activeModal: 'TEST_MODAL', controlsEnabled: false })

      fireEvent.click(container.querySelector('.modal__close'))

      const { activeModal, controlsEnabled } = useStore.getState()

      expect(activeModal).toBeNull()
      expect(controlsEnabled).toBe(true)
    })
  })

  describe('onKeyPressed()', () => {
    it('should close the modal when escape is pressed and the modal is open', () => {
      renderModule({ activeModal: 'TEST_MODAL', controlsEnabled: false })

      fireEvent.keyDown(window, { keyCode: ESCAPE })

      const { activeModal, controlsEnabled } = useStore.getState()

      expect(activeModal).toBeNull()
      expect(controlsEnabled).toBe(true)
    })

    it('should do nothing when escape is pressed and the modal is closed', () => {
      renderModule({ activeModal: 'OTHER_MODAL', controlsEnabled: false })

      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(useStore.getState().activeModal).toEqual('OTHER_MODAL')
    })

    it('should do nothing when another key is pressed', () => {
      renderModule({ activeModal: 'TEST_MODAL' })

      fireEvent.keyDown(window, { keyCode: 13 })

      expect(useStore.getState().activeModal).toEqual('TEST_MODAL')
    })

    it('should stop listening once unmounted', () => {
      const { unmount } = renderModule({ activeModal: 'TEST_MODAL' })

      unmount()
      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(useStore.getState().activeModal).toEqual('TEST_MODAL')
    })
  })
})
