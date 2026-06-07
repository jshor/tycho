import React from 'react';

interface Props {
    onClick: () => void;
    uxTime?: string;
    children?: React.ReactNode;
}

export default class DatePicker extends React.Component<Props> {

    render() {
        return (
            <div className="date-picker">
                <span
                    className="date-picker__display"
                    onClick={this.props.onClick}>
                    {this.props.uxTime}
                </span>
                {this.props.children}
            </div>
        );
    }
}
