import React from 'react';
import { connect } from 'react-redux';
import * as Actions from '../actions/UIControlsActions';
import ReduxService from '../services/ReduxService';
import Modal from '../components/Modal';

export class ModalContainer extends React.Component {

    componentWillMount = () => {
        window.addEventListener('keydown', this.onKeyPressed);
    }

    /**
     * Closes the modal when the escape key is pressed.
     *
     * @param {Event} evt - keypress event
     */
    onKeyPressed = (evt) => {
        if (evt.keyCode === 27 && this.isModalActive()) {
            this.closeModal();
        }
    }

    /**
     * Checks if current modal instance is open (active).
     *
     * @returns {Boolean}
     */
    isModalActive = () => {
        return this.props.activeModal === this.props.type;
    }

    /**
     * Closes the modal.
     */
    closeModal = () => {
        this.props.action.toggleModal(null);
        this.props.action.setUIControls(true);
    }

    render() {
        return (
            <Modal
                modalActive={this.isModalActive()}
                title={this.props.title}
                closeModal={this.closeModal}
                children={this.props.children}
            />
        );
    }
}

export default connect(
    ReduxService.mapStateToProps(
        'uiControls.activeModal'
    ),
    ReduxService.mapDispatchToProps(Actions)
)(ModalContainer);
