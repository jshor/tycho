import React from 'react'
import { BoundActions } from '../types'
import { connect } from 'react-redux'
import * as EventActions from '../actions/EventActions'
import ReduxService from '../services/ReduxService'

/** Supplied by connect, out of the event reducer. */
interface StateProps {
  touched?: number
  released?: number
}

/** Passed in by whoever renders the container. */
interface OwnProps {
  onWheel?: React.WheelEventHandler<HTMLDivElement>
  children?: React.ReactNode
}

interface Props extends StateProps, OwnProps {
  action?: Pick<BoundActions, 'setTouched' | 'setReleased'>
}

export class EventContainer extends React.Component<Props> {
  onTouched = () => {
    this.props.action.setTouched(Date.now())
  }

  onReleased = () => {
    this.props.action.setReleased(Date.now())
  }

  render() {
    return (
      <div onWheel={this.props.onWheel} onTouchStart={this.onTouched} onMouseDown={this.onTouched}>
        {this.props.children}
      </div>
    )
  }
}

export default connect(
  ReduxService.mapStateToProps<StateProps>('event.touched', 'event.released'),
  ReduxService.mapDispatchToProps<Props['action']>(EventActions)
)(EventContainer)
