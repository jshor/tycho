import React from 'react';
import DomLabel from 'three-dom-label';

interface Props {
    text: string;
    id: string;
    action: Record<string, any>;
    targetId?: string;
}

interface LabelNextProps {
    id: string;
    targetId?: string;
}

export default class Label extends React.Component<Props> {

    label: any;

    componentDidMount = () => {
        this.label = this.getLabel();
        (this.refs as any).group.add(this.label);
    }

    componentWillUnmount = () => this.label.unmount()

    componentWillReceiveProps = (nextProps: LabelNextProps) => {
        this.maybeUpdateClassName(nextProps);
    }

    maybeUpdateClassName = ({ id, targetId }: LabelNextProps) => {
        if (this.props.targetId !== targetId) {
            const isActive = id === targetId;
            const classSuffix = isActive ? 'active' : 'inactive';

            this.label.setClass(`label label--${classSuffix}`);
        }
    }

    getLabel = () => {
        const { id, text, action } = this.props;
        const classPrefix = 'label label';

        return new DomLabel({
            ...this.props,
            events: {
                click: action.setActiveOrbital.bind(this, id, text),
                mouseover: action.addHighlightedOrbital.bind(this, id),
                mouseout: action.removeHighlightedOrbital.bind(this, id)
            },
            className: `${classPrefix}--inactive`
        });
    }

    render() {
        return <group ref="group"></group>;
    }
}
