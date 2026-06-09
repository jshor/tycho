import React from 'react';
import Markdown from '../Markdown';
import SceneContainer from '../../containers/SceneContainer';
import UIControlsContainer from '../../containers/UIControlsContainer';
import LoaderContainer from '../../containers/LoaderContainer';
import TourContainer from '../../containers/TourContainer';
import ModalContainer from '../../containers/ModalContainer';
import StatsContainer from '../../containers/StatsContainer';
import Constants from '../../constants';

export default class App extends React.Component {
    render() {
        return (
            <div>
                <SceneContainer
                    onAnimate={this.props.onAnimate}
                    width={window.innerWidth}
                    height={window.innerHeight}
                />
                <UIControlsContainer />
                <LoaderContainer />
                <TourContainer labels={Constants.Tour.LABELS} />
                <ModalContainer
                    type={Constants.UI.ModalTypes.STATS_MODAL}
                    title={this.props.title}>
                    <StatsContainer />
                </ModalContainer>
                <ModalContainer
                    type={Constants.UI.ModalTypes.ABOUT_MODAL}
                    title={this.props.pageText.aboutTitle}>
                    <Markdown text={this.props.pageText.aboutInfo} />
                </ModalContainer>
            </div>
        );
    }
}


