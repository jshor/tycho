import React, { useCallback, useEffect } from 'react'
import { useStore } from '../store'
import { Constants } from '../constants'
import { Modal as ModalView } from '../components/modal/modal'
import { Store } from '../types'

interface Props {
  /** The type of modal this module renders. */
  type?: string
  /** The contents of the modal. */
  children?: React.ReactNode
}

/** The key code that dismisses an open modal. */
const ESCAPE_KEY_CODE = 27

/**
 * Reads the title a modal of the given type wears, out of the store.
 */
const selectTitle = (type: string) => (state: Store) => {
  return type === Constants.UI.ModalTypes.STATS_MODAL
    ? state.targetName
    : state.pageText?.aboutTitle
}

/**
 * Connects a modal to the store, closing it on escape.
 */
export function Modal({ type, children }: Props) {
  const activeModal = useStore((state) => state.activeModal)
  const title = useStore(selectTitle(type))

  /**
   * Whether this module's modal is the one currently open.
   */
  const isModalActive = (): boolean => activeModal === type

  /**
   * Closes the modal and hands interactivity back to the UI controls.
   */
  const closeModal = useCallback(() => {
    useStore.setState({ activeModal: null, controlsEnabled: true })
  }, [])

  /**
   * Dismisses the modal when escape is pressed while it is open.
   */
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
