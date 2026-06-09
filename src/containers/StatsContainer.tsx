import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import ReduxService from '../services/ReduxService';
import OrbitalService from '../services/OrbitalService';
import Constants from '../constants';
import Stats from '../components/Stats';

export class StatsContainer extends React.Component {

    componentWillMount = () => {
        this.setState({});
    }

    componentWillReceiveProps = (nextProps) => {
        const { targetId, time } = nextProps;

        if (this.props.targetId !== targetId || this.props.time !== time) {
            this.updateOrbitalStats(targetId, time);
        }
    }

    /**
     * Updates orbital information.
     *
     * @param {String} targetId - name of active target
     * @param {Number} time - current UNIX time
     */
    updateOrbitalStats = (targetId, time) => {
        const { orbitalData } = this.props;
        const target = OrbitalService.getTargetByName(orbitalData, targetId);

        if (target) {
            const { name, description } = target;
            this.setState({
                name,
                description,
                ...OrbitalService.getOrbitalStats(target, time)
            });
        }
    }

    /**
     * Returns the current UNIX time prop in UI-friendly format.
     *
     * @returns {String} UI-friendly time
     */
    getTime = () => {
        return moment(this.props.time * 1000)
            .format(Constants.UI.UX_DATE_FORMAT);
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
        );
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
)(StatsContainer);
