import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { Modal, Props } from '../modal'

const action = { toggleModal: vi.fn(), setUIControls: vi.fn() }

/** The key code that dismisses an open modal. */
const ESCAPE = 27

describe('Modal Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderModule = (props: Partial<Props> = {}) => {
    return renderWithStore(<Modal action={action} type="TEST_MODAL" {...props} />)
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

  describe('closeModal()', () => {
    it('should toggle the modal closed and re-enable the UI controls', () => {
      const { container } = renderModule({ activeModal: 'TEST_MODAL' })

      fireEvent.click(container.querySelector('.modal__close'))

      expect(action.toggleModal).toHaveBeenCalledWith(null)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })
  })

  describe('onKeyPressed()', () => {
    it('should close the modal when escape is pressed and the modal is open', () => {
      renderModule({ activeModal: 'TEST_MODAL' })

      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(action.toggleModal).toHaveBeenCalledWith(null)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should do nothing when escape is pressed and the modal is closed', () => {
      renderModule({ activeModal: null })

      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(action.toggleModal).not.toHaveBeenCalled()
    })

    it('should do nothing when another key is pressed', () => {
      renderModule({ activeModal: 'TEST_MODAL' })

      fireEvent.keyDown(window, { keyCode: 13 })

      expect(action.toggleModal).not.toHaveBeenCalled()
    })

    it('should stop listening once unmounted', () => {
      const { unmount } = renderModule({ activeModal: 'TEST_MODAL' })

      unmount()
      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(action.toggleModal).not.toHaveBeenCalled()
    })
  })
})
