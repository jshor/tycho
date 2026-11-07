import React, { useId } from 'react'
import cx from 'classnames'
import './modal.scss'

interface Props {
  /** Whether the modal is currently open. */
  modalActive?: boolean
  /** Closes the modal. */
  closeModal: () => void
  /** The title shown in the modal header. */
  title?: React.ReactNode
  /** Modal reference. */
  ref?: React.Ref<HTMLDivElement>
  /** Close HTML button reference. */
  closeRef?: React.Ref<HTMLButtonElement>
  /** The contents of the modal. */
  children?: React.ReactNode
}

/**
 * A titled, dismissible overlay panel.
 */
export function Modal({ modalActive, closeModal, title, ref, closeRef, children }: Props) {
  const titleId = useId()

  return (
    <>
      {modalActive && <div className="modal__overlay" aria-hidden="true" onClick={closeModal} />}
      <div
        ref={ref}
        className={`modal modal--${cx({
          open: modalActive,
          closed: !modalActive
        })}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!modalActive}
      >
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="modal__close"
            aria-label="Close"
            onClick={closeModal}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="modal__content">{children}</div>
      </div>
    </>
  )
}
