import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {SpinLabelContainer} from '../SpinLabelContainer';

describe('Spin Label Container', () => {
    let component;
    let spinLabelContainer;

    beforeEach(() => {
        component = shallow(<SpinLabelContainer />);
        spinLabelContainer = component.instance();
    });

    describe('componentWillReceiveProps()', () => {
        it('should call maybeStopSpinPrompt() with nextProps', () => {
            const spy = jest.spyOn(spinLabelContainer, 'maybeStopSpinPrompt');
            const nextProps = {};

            spinLabelContainer.props = nextProps;
            spinLabelContainer.componentWillReceiveProps(nextProps);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(nextProps);
        });
    });

    describe('maybeStopSpinPrompt()', () => {
        beforeEach(() => {
            spinLabelContainer.props = {
                action: {
                    setCameraOrbit: jest.fn(),
                    setUIControls: jest.fn()
                }
            }
        });

        describe('when the label is visible', () => {
            beforeEach(() => {
                spinLabelContainer.isVisible = () => true;
                spinLabelContainer.props.touched = false;
            });

            describe('when the touched prop value has changed', () => {
                it('should call the setCameraOrbit() action with false', () => {
                    const spy = jest.spyOn(spinLabelContainer.props.action, 'setCameraOrbit');

                    spinLabelContainer.maybeStopSpinPrompt({touched: true});

                    expect(spy).toHaveBeenCalled();
                    expect(spy).toHaveBeenCalledTimes(1);
                    expect(spy).toHaveBeenCalledWith(false);
                });

                it('should call the setUIControls() action with true', () => {
                    const spy = jest.spyOn(spinLabelContainer.props.action, 'setUIControls');

                    spinLabelContainer.maybeStopSpinPrompt({touched: true});

                    expect(spy).toHaveBeenCalled();
                    expect(spy).toHaveBeenCalledTimes(1);
                    expect(spy).toHaveBeenCalledWith(true);
                });
            });

            describe('when the touched prop value has not changed', () => {
                it('should not call the setCameraOrbit()', () => {
                    const spy = jest.spyOn(spinLabelContainer.props.action, 'setCameraOrbit');

                    spinLabelContainer.maybeStopSpinPrompt({touched: false});

                    expect(spy).not.toHaveBeenCalled();
                });
            });
        });

        describe('when the label is not visible', () => {
            beforeEach(() => {
                spinLabelContainer.isVisible = () => true;
                spinLabelContainer.props.touched = true;
            });

            it('should not call the setCameraOrbit()', () => {
                const spy = jest.spyOn(spinLabelContainer.props.action, 'setCameraOrbit');

                spinLabelContainer.maybeStopSpinPrompt({touched: true});

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('isVisible()', () => {
        it('should return true if both isAutoOrbitEnabled and isComplete props are true', () => {
            spinLabelContainer.props = {
                isAutoOrbitEnabled: true,
                isComplete: true
            };
            expect(spinLabelContainer.isVisible()).toEqual(true);
        });

        it('should return true if both isAutoOrbitEnabled is false', () => {
            spinLabelContainer.props = {
                isAutoOrbitEnabled: false,
                isComplete: true
            };
            expect(spinLabelContainer.isVisible()).toEqual(false);
        });

        it('should return true if both isComplete is false', () => {
            spinLabelContainer.props = {
                isAutoOrbitEnabled: true,
                isComplete: false
            };
            expect(spinLabelContainer.isVisible()).toEqual(false);
        });
    });

    describe('render()', () => {
        it('should render the spin label container successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
