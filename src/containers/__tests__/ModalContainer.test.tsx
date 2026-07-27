import React from 'react'
import { renderWithStore } from '../../test/render'
import { ModalContainer } from '../ModalContainer'
import { Mutable } from '../../test/helpers'

const action = { toggleModal: vi.fn(), setUIControls: vi.fn() }

describe('Modal Container', () => {
  let ref: React.RefObject<ModalContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<ModalContainer>()
    renderWithStore(<ModalContainer action={action} type="TEST_MODAL" ref={ref} />)
  })

  afterEach(() => {
    window.removeEventListener('keydown', ref.current?.onKeyPressed)
  })

  describe('componentDidMount()', () => {
    it('should register a keydown listener on window', () => {
      const spy = vi.spyOn(window, 'addEventListener')
      ref.current?.componentDidMount?.()
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('componentWillUnmount()', () => {
    it('should remove the keydown listener', () => {
      const spy = vi.spyOn(window, 'removeEventListener')
      ref.current?.componentWillUnmount?.()
      expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('isModalActive()', () => {
    it('should return true when activeModal matches type', () => {
      const current = ref.current as Mutable<ModalContainer>
      current.props = {
        activeModal: 'TEST_MODAL',
        type: 'TEST_MODAL'
      }
      expect(current.isModalActive()).toBe(true)
    })

    it('should return false when types differ', () => {
      const current = ref.current as Mutable<ModalContainer>
      current.props = {
        activeModal: 'OTHER_MODAL',
        type: 'TEST_MODAL'
      }
      expect(current.isModalActive()).toBe(false)
    })
  })

  describe('closeModal()', () => {
    it('should toggle the modal closed and re-enable UI controls', () => {
      const current = ref.current as Mutable<ModalContainer>
      current.props = { action }
      current.closeModal()

      expect(action.toggleModal).toHaveBeenCalledWith(null)
      expect(action.setUIControls).toHaveBeenCalledWith(true)
    })
  })

  describe('onKeyPressed()', () => {
    it('should close the modal when Escape is pressed and modal is active', () => {
      const container = ref.current as Mutable<ModalContainer>
      container.props = {
        action,
        activeModal: 'TEST_MODAL',
        type: 'TEST_MODAL'
      }
      const spy = vi.spyOn(container, 'closeModal')

      container.onKeyPressed(new KeyboardEvent('keydown', { keyCode: 27 }))

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should not close the modal when Escape is pressed but modal is inactive', () => {
      const container = ref.current as Mutable<ModalContainer>
      container.props = {
        action,
        activeModal: null,
        type: 'TEST_MODAL'
      }
      const spy = vi.spyOn(container, 'closeModal')

      container.onKeyPressed(new KeyboardEvent('keydown', { keyCode: 27 }))

      expect(spy).not.toHaveBeenCalled()
    })
  })
})
