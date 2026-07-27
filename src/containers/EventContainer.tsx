import React from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import * as EventActions from '../actions/EventActions'
import ReduxService from '../services/ReduxService'

/** Supplied by connect, out of the event reducer. */
interface StateProps {
  /** When the user last began interacting with the scene. */
  touched?: number
  /** When the user last stopped interacting with the scene. */
  released?: number
}

/** Passed in by whoever renders the container. */
interface OwnProps {
  /** Invoked when the user scrolls over the scene. */
  onWheel?: React.WheelEventHandler<HTMLDivElement>
  /** The scene the events are captured for. */
  children?: React.ReactNode
}

export interface Props extends StateProps, OwnProps {
  /** Store actions. */
  action?: Pick<BoundActions, 'setTouched'>
}

/**
 * Records when the user begins interacting with the scene.
 */
export function EventContainer({ onWheel, children, action }: Props) {
  /** Records the moment the user reached for the scene. */
  const onTouched = () => {
    action.setTouched(Date.now())
  }

  return (
    <div onWheel={onWheel} onTouchStart={onTouched} onMouseDown={onTouched}>
      {children}
    </div>
  )
}

export default connect(
  ReduxService.mapStateToProps<StateProps>('event.touched', 'event.released'),
  ReduxService.mapDispatchToProps<Props['action']>(EventActions)
)(EventContainer)
