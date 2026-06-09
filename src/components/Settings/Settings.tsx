import React from 'react';
import cx from 'classnames';
import ScaleSlider from '../Slider/ScaleSlider';
import Constants from '../../constants';

export default class Settings extends React.Component {
    render() {
        return (
            <div className={cx({
                'settings-panel': true,
                'settings-panel--open': this.props.settingsActive
            })}>
                <div className="settings-panel__header">
                    <div className="settings-panel__title">
                        {this.props.pageText.settings}
                    </div>
                    <div
                        className={cx({
                            'settings-panel__hamburger': true,
                            'settings-panel__hamburger--open': this.props.settingsActive
                        })}
                        onClick={this.props.toggleSetting}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div className={cx({
                    'settings-panel__content': true,
                    'settings-panel__content--open': this.props.settingsActive
                })}>
                    <ScaleSlider
                        value={this.props.speed}
                        label={this.props.pageText.speedScale}
                        onChange={this.props.changeSpeed}
                        min={Constants.UI.Sliders.Speed.MIN}
                        max={Constants.UI.Sliders.Speed.MAX}
                    />
                    <br />
                    <ScaleSlider
                        value={this.props.scale}
                        label={this.props.pageText.planetScale}
                        onChange={this.props.changeScale}
                        min={Constants.UI.Sliders.Scale.MIN}
                        max={Constants.UI.Sliders.Scale.MAX}
                    />
                    <br />
                    <br />
                </div>
            </div>
        );
    }
}
