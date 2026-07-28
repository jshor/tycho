import React from 'react'
import cx from 'classnames'

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
    <div
      className={`modal modal--${cx({
        open: modalActive,
        closed: !modalActive
      })}`}
    >
      <div className="modal__header">
        <span>{title}</span>
        <span className="modal__close" onClick={closeModal}>
          &times;
        </span>
      </div>

      <div className="modal__content">{children}</div>
    </div>
  )
}
