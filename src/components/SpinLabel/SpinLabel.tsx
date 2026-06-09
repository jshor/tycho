import React from 'react';

interface Props {
    show?: boolean;
    count?: number;
}

export default class SpinLabel extends React.Component<Props> {

    createArrowSet = (modifier: string, count: number) => {
        const base = 'spin__arrow';
        const arrows: React.ReactNode[] = [];

        for (let i = 0; i < count; i++) {
            arrows.push(
                <span
                    className={`${base} ${base}--${modifier}`}
                    key={i}>
                </span>
            );
        }

        return (
            <div className={`${base}-container--${modifier}`}>
                {arrows}
            </div>
        );
    }

    render() {
        const { count, show } = this.props;
        const modifier = show ? 'show' : 'hide';

        return (
            <div className={`spin-container spin-container--${modifier}`}>
                <div className="spin">
                    {this.createArrowSet('left', count)}
                    <div className="spin__label">Spin</div>
                    {this.createArrowSet('right', count)}
                </div>
            </div>
        );
    }
}
