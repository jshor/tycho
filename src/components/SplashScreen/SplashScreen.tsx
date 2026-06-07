import React from 'react';
import cx from 'classnames';
import { PageText } from '../../types';

interface Props {
    show?: boolean;
    pageText?: PageText;
    percent?: number;
    enterScene?: () => void;
}

export default class SplashScreen extends React.Component<Props> {

    renderEnterButton = () => {
        return (
            <div className="splash-screen__button">
                <a
                    className="splash-screen__button-anchor"
                    onClick={this.props.enterScene}>
                    {this.props.pageText && this.props.pageText.start}
                </a>
            </div>
        );
    }

    renderLoadingBar = () => {
        return (
            <div className="splash-screen__loading">
                <div
                    className="splash-screen__loading-bar"
                    style={{ width: `${this.props.percent}%` }}>
                </div>
            </div>
        );
    }

    renderUserPrompt = () => {
        if (this.props.percent === 100) {
            return this.renderEnterButton();
        }
        return this.renderLoadingBar();
    }

    render() {
        return (
            <div className={cx({
                'splash-screen': true,
                'splash-screen--hide': !this.props.show,
                'splash-screen--show': this.props.show
            })}>
                <div className="splash-screen__hero">
                </div>
                <div className="splash-screen__content">
                    {this.renderUserPrompt()}
                </div>
            </div>
        );
    }
}
