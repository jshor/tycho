import { fireEvent } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import { ModalContainer, Props } from '../ModalContainer'

const action = { toggleModal: vi.fn(), setUIControls: vi.fn() }

/** The key code that dismisses an open modal. */
const ESCAPE = 27

describe('Modal Container', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderContainer = (props: Partial<Props> = {}) => {
    return renderWithStore(<ModalContainer action={action} type="TEST_MODAL" {...props} />)
  }

  describe('isModalActive()', () => {
    it('should open the modal when the active modal is its own type', () => {
      const { container } = renderContainer({ activeModal: 'TEST_MODAL' })

      expect(container.querySelector('.modal--open')).not.toBeNull()
    })

    it('should close the modal when another modal is active', () => {
      const { container } = renderContainer({ activeModal: 'OTHER_MODAL' })

      expect(container.querySelector('.modal--closed')).not.toBeNull()
    })
  })

  describe('closeModal()', () => {
    it('should toggle the modal closed and re-enable the UI controls', () => {
      const { container } = renderContainer({ activeModal: 'TEST_MODAL' })

      fireEvent.click(container.querySelector('.modal__close'))

      expect(action.toggleModal).toHaveBeenCalledWith(null)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })
  })

  describe('onKeyPressed()', () => {
    it('should close the modal when escape is pressed and the modal is open', () => {
      renderContainer({ activeModal: 'TEST_MODAL' })

      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(action.toggleModal).toHaveBeenCalledWith(null)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })

    it('should do nothing when escape is pressed and the modal is closed', () => {
      renderContainer({ activeModal: null })

      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(action.toggleModal).not.toHaveBeenCalled()
    })

    it('should do nothing when another key is pressed', () => {
      renderContainer({ activeModal: 'TEST_MODAL' })

      fireEvent.keyDown(window, { keyCode: 13 })

      expect(action.toggleModal).not.toHaveBeenCalled()
    })

    it('should stop listening once unmounted', () => {
      const { unmount } = renderContainer({ activeModal: 'TEST_MODAL' })

      unmount()
      fireEvent.keyDown(window, { keyCode: ESCAPE })

      expect(action.toggleModal).not.toHaveBeenCalled()
    })
  })
})
