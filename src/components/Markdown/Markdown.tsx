import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
    text: string;
}

export default class Markdown extends React.Component<Props> {

    render() {
        return (
            <div className="markdown">
                <ReactMarkdown>{this.props.text}</ReactMarkdown>
            </div>
        );
    }
}
