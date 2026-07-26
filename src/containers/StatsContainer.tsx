import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import ReduxService from '../services/ReduxService'
import OrbitalService from '../services/OrbitalService'
import Constants from '../constants'
import Stats from '../components/Stats'
import { OrbitalData, PageText } from '../types'

interface Props {
  targetId?: string
  orbitalData?: OrbitalData[]
  pageText?: PageText
  time?: number
}

interface State {
  name?: string
  description?: string
  magnitude?: string
  velocity?: string
  trueAnomaly?: string
}

export class StatsContainer extends React.Component<Props, State> {
  state: State = {}

  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.targetId !== this.props.targetId || prevProps.time !== this.props.time) {
      this.updateOrbitalStats(this.props.targetId, this.props.time)
    }
  }

  updateOrbitalStats = (targetId: string, time: number) => {
    const { orbitalData } = this.props
    const target = OrbitalService.getTargetByName(orbitalData, targetId)

    if (target) {
      const { name, description } = target
      this.setState({
        name,
        description,
        ...OrbitalService.getOrbitalStats(target, time)
      })
    }
  }

  getTime = (): string => {
    return moment(this.props.time * 1000).format(Constants.UI.UX_DATE_FORMAT)
  }

  render() {
    return (
      <Stats
        description={this.state.description}
        velocity={this.state.velocity}
        magnitude={this.state.magnitude}
        trueAnomaly={this.state.trueAnomaly}
        pageText={this.props.pageText}
        time={this.getTime()}
      />
    )
  }
}

export default connect(
  ReduxService.mapStateToProps(
    'label.targetId',
    'data.orbitalData',
    'data.pageText',
    'animation.time'
  ),
  null
)(StatsContainer)
