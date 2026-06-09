import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

export default class SplashScreen extends React.Component {

    static propTypes = {
        show: PropTypes.bool,
        pageText: PropTypes.object,
        enterScene: PropTypes.func
    }

    /**
     * Renders the enter button.
     *
     * @return {HTMLElement}
     */
    renderEnterButton = () => {
        return (
            <div className="splash-screen__button">
                <a
                    className="splash-screen__button-anchor"
                    onClick={this.props.enterScene}>
                    {this.props.pageText.start}
                </a>
            </div>
        );
    }

    /**
     * Renders the loading bar.
     *
     * @return {HTMLElement}
     */
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

    /**
     * Renders the element to display.
     * Displays loading bar if loading, or the start bar otherwise.
     *
     * @return {HTMLElement}
     */
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
