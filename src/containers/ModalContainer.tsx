import React from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import * as Actions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'
import Modal from '../components/Modal'

/** Passed in by whoever renders the container. */
interface OwnProps {
  type?: string
  title?: string
  children?: React.ReactNode
}

/** Supplied by connect. */
interface StateProps {
  activeModal?: string | null
}

interface Props extends StateProps, OwnProps {
  action?: Pick<BoundActions, 'setUIControls' | 'toggleModal'>
}

export class ModalContainer extends React.Component<Props> {
  componentDidMount = () => {
    window.addEventListener('keydown', this.onKeyPressed)
  }

  componentWillUnmount = () => {
    window.removeEventListener('keydown', this.onKeyPressed)
  }

  onKeyPressed = (evt: KeyboardEvent) => {
    if (evt.keyCode === 27 && this.isModalActive()) {
      this.closeModal()
    }
  }

  isModalActive = (): boolean => {
    return this.props.activeModal === this.props.type
  }

  closeModal = () => {
    this.props.action.toggleModal(null)
    this.props.action.setUIControls(true)
  }

  render() {
    return (
      <Modal
        modalActive={this.isModalActive()}
        title={this.props.title}
        closeModal={this.closeModal}
      >
        {this.props.children}
      </Modal>
    )
  }
}

export default connect(
  ReduxService.mapStateToProps<StateProps>('uiControls.activeModal'),
  ReduxService.mapDispatchToProps<Props['action']>(Actions)
)(ModalContainer)
