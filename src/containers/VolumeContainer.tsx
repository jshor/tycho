import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import Volume from '../components/Volume';
import * as UIControlsActions from '../actions/UIControlsActions';
import ReduxService from '../services/ReduxService';

export class VolumeContainer extends React.Component {

    static propTypes = {
        volume: PropTypes.number
    }

    componentWillReceiveProps = ({ volume }) => {
        if (volume && !this.getVolume()) {
            // if cookie has disabled autoplay, reverse the volume change to zero
            this.props.action.setVolume(0);
        }
    }

    /**
     * Sets the volume cookie value.
     *
     * @param  {Number} volume - desired volume [0,1]
     */
    setVolume = (volume) => {
        Cookies.set('volume', volume, { expires: 365 });
    }

    /**
     * Returns the volume cookie value.
     * Defaults to 1.
     *
     * @return {Number} volume
     */
    getVolume = () => {
        const volume = parseInt(Cookies.get('volume'), 10);
        return isNaN(volume) ? 1 : volume;
    }

    /**
     * Triggers the volume. If the volume is 1, set to 0.
     * Otherwise, set to 1.
     */
    triggerVolume = () => {
        const volume = this.getVolume() ? 0 : 1;

        this.setVolume(volume);
        this.props.action.setVolume(volume);
    }

    render() {
        return <Volume
            onClick={this.triggerVolume}
            playing={!!this.props.volume}
        />;
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'uiControls.volume'
    ),
    ReduxService.mapDispatchToProps(
        UIControlsActions
    )
)(VolumeContainer);
