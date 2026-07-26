import React from 'react'
import cx from 'classnames'

interface Props {
  modalActive?: boolean
  closeModal: () => void
  title?: string
  children?: React.ReactNode
}

export default class Modal extends React.Component<Props> {
  render() {
    return (
      <div
        className={`modal modal--${cx({
          open: this.props.modalActive,
          closed: !this.props.modalActive
        })}`}
      >
        <div className="modal__header">
          <span>{this.props.title}</span>
          <span className="modal__close" onClick={this.props.closeModal}>
            &times;
          </span>
        </div>

        <div className="modal__content">{this.props.children}</div>
      </div>
    )
  }
}
