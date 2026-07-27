import React, { useCallback, useEffect } from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import * as Actions from '../actions/UIControlsActions'
import ReduxService from '../services/ReduxService'
import ModalView from '../components/modal'

/** Passed in by whoever renders the container. */
interface OwnProps {
  /** The type of modal this module renders. */
  type?: string
  /** The title shown in the modal header. */
  title?: string
  /** The contents of the modal. */
  children?: React.ReactNode
}

/** Supplied by connect. */
interface StateProps {
  /** The type of the modal currently open, if any. */
  activeModal?: string | null
}

export interface Props extends StateProps, OwnProps {
  /** Store actions. */
  action?: Pick<BoundActions, 'setUIControls' | 'toggleModal'>
}

/** The key code that dismisses an open modal. */
const ESCAPE_KEY_CODE = 27

/**
 * Connects a modal to the store, closing it on escape.
 */
export function Modal({ type, title, children, activeModal, action }: Props) {
  /** Whether this module's modal is the one currently open. */
  const isModalActive = (): boolean => activeModal === type

  /** Closes the modal and hands interactivity back to the UI controls. */
  const closeModal = useCallback(() => {
    action.toggleModal(null)
    action.setUIControls(true)
  }, [action])

  /** Dismisses the modal when escape is pressed while it is open. */
  useEffect(() => {
    const onKeyPressed = (evt: KeyboardEvent) => {
      if (evt.keyCode === ESCAPE_KEY_CODE && activeModal === type) {
        closeModal()
      }
    }

    window.addEventListener('keydown', onKeyPressed)

    return () => window.removeEventListener('keydown', onKeyPressed)
  }, [activeModal, type, closeModal])

  return (
    <ModalView modalActive={isModalActive()} title={title} closeModal={closeModal}>
      {children}
    </ModalView>
  )
}

export default connect(
  ReduxService.mapStateToProps<StateProps>('uiControls.activeModal'),
  ReduxService.mapDispatchToProps<Props['action']>(Actions)
)(Modal)
