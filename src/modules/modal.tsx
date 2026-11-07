import React, { useCallback, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { Constants } from '../constants'
import { Modal as ModalView } from '../components/modal/modal'
import { OrbitalSymbol } from '../components/orbitalSymbol/orbitalSymbol'
import { recoverFocus } from '../utils/a11y'

interface Props {
  /** The type of modal this module renders. */
  type?: string
  /** The contents of the modal. */
  children?: React.ReactNode
}

/** The key that dismisses an open modal. */
const ESCAPE_KEY = 'Escape'

/**
 * Connects a modal to the store, closing it on escape.
 */
export function Modal({ type, children }: Props) {
  const activeModal = useStore((state) => state.activeModal)
  const targetName = useStore((state) => state.targetName)
  const aboutTitle = useStore((state) => state.pageText?.aboutTitle)
  // the sign is the one thing about the target that has to be looked up in the data
  const targetSymbol = useStore((state) => state.target?.symbol)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  /** Whether or not this module's modal is the one currently open. */
  const isModalActive = (): boolean => activeModal === type

  /** Whether this modal describes the orbital the camera is watching, rather than the app. */
  const isStatsModal = type === Constants.UI.ModalTypes.STATS_MODAL

  /**
   * Closes the modal to hand interactivity back to the UI controls.
   */
  const closeModal = useCallback(() => {
    useStore.setState({ activeModal: null, controlsEnabled: true })
  }, [])

  /**
   * Caches the width of the modal in the store (0 if closed).
   */
  useEffect(() => {
    if (activeModal !== type) return

    const setModalWidth = () => {
      useStore.setState({ modalWidth: modalRef.current?.offsetWidth ?? 0 })
    }

    setModalWidth()
    window.addEventListener('resize', setModalWidth)

    return () => {
      window.removeEventListener('resize', setModalWidth)
      useStore.setState({ modalWidth: 0 })
    }
  }, [activeModal, type])

  /**
   * Dismisses the modal when escape is pressed while it is open.
   */
  useEffect(() => {
    const onKeyPressed = (evt: KeyboardEvent) => {
      if (evt.key === ESCAPE_KEY && activeModal === type) {
        closeModal()
      }
    }

    window.addEventListener('keydown', onKeyPressed)

    return () => window.removeEventListener('keydown', onKeyPressed)
  }, [activeModal, type, closeModal])

  /**
   * Focuses the modal when opening or restores focus to the original element when closing.
   */
  useEffect(() => {
    if (activeModal !== type) return

    const opener = document.activeElement as HTMLElement | null

    // the modal was hidden until now and is only focusable once it has been drawn visible
    requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }))

    return () => {
      if (opener?.isConnected && opener !== document.body) {
        // the opener sits in the scene
        requestAnimationFrame(() => opener.focus({ preventScroll: true }))
      } else {
        recoverFocus()
      }
    }
  }, [activeModal, type])

  return (
    <ModalView
      ref={modalRef}
      closeRef={closeRef}
      modalActive={isModalActive()}
      title={
        isStatsModal ? (
          <>
            <OrbitalSymbol symbol={targetSymbol} />
            {targetName}
          </>
        ) : (
          aboutTitle
        )
      }
      closeModal={closeModal}
    >
      {children}
    </ModalView>
  )
}
