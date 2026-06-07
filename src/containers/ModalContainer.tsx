import React from 'react';
import { connect } from 'react-redux';
import * as Actions from '../actions/UIControlsActions';
import ReduxService from '../services/ReduxService';
import Modal from '../components/Modal';

interface Props {
    activeModal?: string | null;
    type?: string;
    title?: string;
    children?: React.ReactNode;
    action?: Record<string, any>;
}

export class ModalContainer extends React.Component<Props> {

    componentWillMount = () => {
        window.addEventListener('keydown', this.onKeyPressed);
    }

    onKeyPressed = (evt: KeyboardEvent) => {
        if (evt.keyCode === 27 && this.isModalActive()) {
            this.closeModal();
        }
    }

    isModalActive = (): boolean => {
        return this.props.activeModal === this.props.type;
    }

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
)(ModalContainer as React.ComponentType<any>) as any;
