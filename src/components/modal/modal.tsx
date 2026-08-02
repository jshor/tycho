import React from 'react'
import cx from 'classnames'
import { onActivate } from '../../utils/a11y'
import './modal.scss'

interface Props {
  /** Whether the modal is currently open. */
  modalActive?: boolean
  /** Closes the modal. */
  closeModal: () => void
  /** The title shown in the modal header. */
  title?: string
  /** The contents of the modal. */
  children?: React.ReactNode
}

/**
 * A titled, dismissible overlay panel.
 */
export function Modal({ modalActive, closeModal, title, children }: Props) {
  return (
    <>
      {modalActive && <div className="modal__overlay" aria-hidden="true" onClick={closeModal} />}
      <div
        className={`modal modal--${cx({
          open: modalActive,
          closed: !modalActive
        })}`}
      >
        <div className="modal__header">
          <span>{title}</span>
          <span
            className="modal__close"
            role="button"
            tabIndex={0}
            onClick={closeModal}
            onKeyDown={onActivate(closeModal)}
          >
            &times;
          </span>
        </div>

        <div className="modal__content">{children}</div>
      </div>
    </>
  )
}
