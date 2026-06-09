import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

export default class Modal extends React.Component {

    static propTypes = {
        modalActive: PropTypes.bool,
        closeModal: PropTypes.func.isRequired,
        title: PropTypes.string
    }

    render() {
        return (
            <div className={`modal modal--${cx({
                open: this.props.modalActive,
                closed: !this.props.modalActive
            })}`}>
                <div className="modal__header">
                    <span>{this.props.title}</span>
                    <span className="modal__close" onClick={this.props.closeModal}>
                        &times;
                    </span>
                </div>

                <div className="modal__content">
                    {this.props.children}
                </div>
            </div>
        );
    }
}
