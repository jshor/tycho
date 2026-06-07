import React from 'react';
import TourLabel from '../components/TourLabel';

interface Props {
    text?: string;
    start?: number;
    end?: number;
}

interface State {
    modifier: string;
}

export default class TourLabelContainer extends React.Component<Props, State> {

    isCancelled: boolean = false;

    componentWillMount = () => {
        const { start, end } = this.props;

        this.setState({ modifier: 'hide' });
        this.setClassAsync('show', start);
        this.setClassAsync('hide', end);
    }

    componentWillUnmount = () => {
        this.isCancelled = true;
    }

    setClassAsync = (modifier: string, timeout: number) => {
        setTimeout(() => {
            if (!this.isCancelled) {
                this.setState({ modifier });
            }
        }, timeout);
    }

    render() {
        return (
            <TourLabel
                modifier={this.state.modifier}
                text={this.props.text}
            />
        );
    }
}
