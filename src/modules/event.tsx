import React from 'react'
import useStore from '../store'

interface Props {
  /** Invoked when the user scrolls over the scene. */
  onWheel?: React.WheelEventHandler<HTMLDivElement>
  /** The scene the events are captured for. */
  children?: React.ReactNode
}

/**
 * Records when the user begins interacting with the scene.
 */
export default function Event({ onWheel, children }: Props) {
  /** Records the moment the user reached for the scene. */
  const onTouched = () => {
    useStore.setState({ touched: Date.now() })
  }

  return (
    <div onWheel={onWheel} onTouchStart={onTouched} onMouseDown={onTouched} style={{
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      position: 'absolute',
      overflow: 'hidden'
    }}>
      {children}
    </div>
  )
}
