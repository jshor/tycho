import React from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';

export default class Markdown extends React.Component {

    static propTypes = {
        text: PropTypes.string.isRequired
    }

    render() {
        return (
            <div className="markdown">
                <ReactMarkdown source={this.props.text} />
            </div>
        )
    }
}