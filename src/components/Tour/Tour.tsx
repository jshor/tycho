import React from 'react';
import SpinLabelContainer from '../../containers/SpinLabelContainer';
import cx from 'classnames';
import { PageText } from '../../types';

interface Props {
    isComplete?: boolean;
    isSkipped?: boolean;
    labels?: React.ReactNode[];
    skipTour?: () => void;
    pageText?: PageText;
}

export default class Tour extends React.Component<Props> {

    render() {
        const { isComplete, isSkipped, labels } = this.props;
        return (
            <div>
                <div className={cx({
                    'tour': true,
                    'tour--skip': isSkipped,
                    'tour--hide': isComplete,
                    'tour--show': !isComplete
                })}>
                    <div
                        className={cx({
                            'tour__theater-bar': true,
                            'tour__theater-bar--skip': isSkipped,
                            'tour__theater-bar--hide': isComplete,
                            'tour__theater-bar--show': !isComplete
                        })}
                        style={{ top: 0 }}>
                    </div>
                    <div className="tour__labels">
                        {labels}
                    </div>
                    <div
                        className={cx({
                            'tour__theater-bar': true,
                            'tour__theater-bar--skip': isSkipped,
                            'tour__theater-bar--hide': isComplete,
                            'tour__theater-bar--show': !isComplete
                        })}
                        style={{ bottom: 0 }}>
                        <span
                            className="tour__skip-link"
                            onClick={this.props.skipTour}>
                            {this.props.pageText && this.props.pageText.skipTour}
                        </span>
                    </div>
                </div>
                <SpinLabelContainer />
            </div>
        );
    }
}
