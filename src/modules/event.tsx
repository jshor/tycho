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
 * Records when the user begins interacting with the scene.
 */
export function Event({ onWheel, onPinch, children }: Props) {
  // the separation the last touch was measured at, kept in a ref because a pinch is reported as
  // the change since the previous frame rather than as a total
  const separation = useRef<number | null>(null)

  /**
   * Records the moment the user reached for the scene.
   */
  const onTouched = () => {
    useStore.setState({ touched: Date.now() })
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
    onTouched()

    if (ev.touches.length === PINCH_TOUCH_COUNT) {
      separation.current = getSeparation(ev)
    }
  }

  /**
   * Reports how much further apart the fingers moved since they were last measured.
   */
  const onTouchMove = (ev: React.TouchEvent<HTMLDivElement>) => {
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
    separation.current = null
  }

  return (
    <div
      role="presentation"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onMouseDown={onTouched}
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
