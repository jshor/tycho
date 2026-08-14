import React, { useRef } from 'react'
import { useStore } from '../store'

interface Props {
  /** Invoked when the user scrolls over the scene. */
  onWheel?: React.WheelEventHandler<HTMLDivElement>
  /** Invoked with how many pixels further apart the user's fingers moved. */
  onPinch?: (separationDelta: number) => void
  /** The scene the events are captured for. */
  children?: React.ReactNode
}

/** How many fingers make a pinch. */
const PINCH_TOUCH_COUNT = 2

/**
 * Records when the user is interacting with the scene, for as long as they keep at it.
 */
export function Event({ onWheel, onPinch, children }: Props) {
  const separation = useRef<number | null>(null)
  const onInteract = useStore((state) => state.recordInteraction)

  /**
   * Scrollwheel event handler.
   */
  const onSceneWheel = (ev: React.WheelEvent<HTMLDivElement>) => {
    onInteract()
    onWheel?.(ev)
  }

  /**
   * Mouse dragging event handler.
   */
  const onMouseMove = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (ev.buttons > 0) {
      onInteract()
    }
  }

  /**
   * Measures how far apart the user's first two fingers are, in px.
   */
  const getSeparation = ({ touches }: React.TouchEvent<HTMLDivElement>): number => {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    )
  }

  /**
   * Starts a pinch once a second finger lands, and notes where it began.
   */
  const onTouchStart = (ev: React.TouchEvent<HTMLDivElement>) => {
    onInteract()

    if (ev.touches.length === PINCH_TOUCH_COUNT) {
      separation.current = getSeparation(ev)
    }
  }

  /**
   * Reports how much further apart the fingers moved since they were last measured.
   */
  const onTouchMove = (ev: React.TouchEvent<HTMLDivElement>) => {
    onInteract()

    if (ev.touches.length !== PINCH_TOUCH_COUNT) return

    const current = getSeparation(ev)

    if (separation.current !== null) {
      ev.preventDefault()
      onPinch?.(current - separation.current)
    }
    separation.current = current
  }

  /**
   * Ends the pinch, so that the next one is measured from where it starts.
   */
  const onTouchEnd = () => {
    onInteract()
    separation.current = null
  }

  return (
    <div
      role="presentation"
      onWheel={onSceneWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onMouseDown={onInteract}
      onMouseMove={onMouseMove}
      onMouseUp={onInteract}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        position: 'absolute',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  )
}
