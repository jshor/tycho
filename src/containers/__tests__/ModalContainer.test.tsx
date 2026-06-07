import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {ModalContainer} from '../ModalContainer';

describe('Modal Container', () => {
    let component;
    let modalContainer;

    beforeEach(() => {
        component = shallow(
            <ModalContainer
                type="TEST_MODAL"
                title="Test Modal"
            />
        );
        modalContainer = component.instance();
    });

    describe('componentWillMount()', () => {
        it('should add the onKeyPressed() method as a keydown event listener', () => {
            const spy = jest.spyOn(window, 'addEventListener');

            modalContainer.componentWillMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith('keydown', modalContainer.onKeyPressed);
        });
    });

    describe('onKeyPressed()', () => {
        let spy;

        beforeEach(() => {
            modalContainer.props = {
                action: {
                    toggleModal: jest.fn(),
                    setUIControls: jest.fn()
                }
            };
            spy = jest.spyOn(modalContainer, 'closeModal');
        });

        describe('when the modal is open', () => {
            beforeEach(() => {
                modalContainer.isModalActive = () => true;
            });

            it('should close the modal when the esc key is pressed', () => {
                modalContainer.onKeyPressed({keyCode: 27});

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
            });

            it('should not close the modal when a key other than escape is pressed', () => {
                modalContainer.onKeyPressed({keyCode: 28});

                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('when the modal is closed', () => {
            it('should not close any modal when the esc key is pressed', () => {
                modalContainer.isModalActive = () => false;
                modalContainer.onKeyPressed({keyCode: 27});

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('closeModal()', () => {
        beforeEach(() => {
            modalContainer.props = {
                action: {
                    toggleModal: jest.fn(),
                    setUIControls: jest.fn()
                }
            };
        });

        it('should call toggleModal action with false', () => {
            const spy = jest.spyOn(modalContainer.props.action, 'toggleModal');

            modalContainer.closeModal();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1)
            expect(spy).toHaveBeenCalledWith(null);
        });

        it('should call setUIControls action with false', () => {
            const spy = jest.spyOn(modalContainer.props.action, 'setUIControls');

            modalContainer.closeModal();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1)
            expect(spy).toHaveBeenCalledWith(true);
        });
    });

    describe('render()', () => {
        it('should render the app successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
