import React from 'react';
import PropTypes from 'prop-types';
import DomLabel from 'three-dom-label';

export default class Label extends React.Component {

    static propTypes = {
        text: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        action: PropTypes.object.isRequired,
        targetId: PropTypes.string
    }

    componentDidMount = () => {
        this.label = this.getLabel();
        this.refs.group.add(this.label);
    }

    componentWillUnmount = () => this.label.unmount()

    componentWillReceiveProps = (nextProps) => {
        this.maybeUpdateClassName(nextProps);
    }

    /**
     * Updates class name if the active target has changed.
     *
     * @param {Object} props
     * @param {String} props.id - id of current orbital
     * @param {String} props.targetId - id of active orbital
     */
    maybeUpdateClassName = ({ id, targetId }) => {
        if (this.props.targetId !== targetId) {
            const isActive = id === targetId;
            const classSuffix = isActive ? 'active' : 'inactive';

            this.label.setClass(`label label--${classSuffix}`);
        }
    }

    /**
     * Renders a new label, with mouse events bound to it.
     *
     * @returns {Object3D} label
     */
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
