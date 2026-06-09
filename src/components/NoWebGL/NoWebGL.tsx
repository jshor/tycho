import React from 'react';
import PropTypes from 'prop-types';

export default class NoWebGL extends React.Component {

    static propTypes = {
        pageText: PropTypes.object.isRequired
    };

    render() {
        return (
            <div className="no-webgl">
                <div className="no-webgl__body">
                    <span className="no-webgl__title">{this.props.pageText.webgl.noWebGl}</span>
                    <p>
                        {this.props.pageText.webgl.required}<br />
                        <a
                            href={this.props.pageText.webgl.enableInstructionsUrl}
                            target="_blank"
                            className="no-webgl__anchor">
                            {this.props.pageText.webgl.clickHere}
                        </a>&nbsp;
                        {this.props.pageText.webgl.learn}
                    </p>
                </div>
            </div>
        );
    }
}
