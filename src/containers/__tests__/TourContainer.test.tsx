import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {TourContainer} from '../TourContainer';
import TourService from '../../services/TourService';
import Constants from '../../constants';

const labels = [
    {
        duration: 5000,
        text: 'Welcome to the Solar System'
    },
    {
        duration: 5000,
        text: 'This is a real-time interactive simulation of major planetary bodies'
    },
    {
        duration: 3000,
        text: 'Let\'s start exploring'
    }
];

jest.useFakeTimers();

describe('Tour Container', () => {
    let component;
    let tourContainer;
    let action;

    beforeEach(() => {
        action = {
            setUIControls: jest.fn(),
            setCameraOrbit: jest.fn(),
            setActiveOrbital: jest.fn(),
            setLabelText: jest.fn(),
            tourCompleted: jest.fn(),
            tourSkipped: jest.fn(),
            showLabel: jest.fn()
        };

        component = shallow(
            <TourContainer
                labels={labels}
                action={action}
                pageText={{}}
            />
        );
        tourContainer = component.instance();
    });

    describe('componentDidMount()', () => {
        let spy;

        beforeEach(() => {
            spy = jest.spyOn(tourContainer.props.action, 'tourSkipped');
        });

        it('should call the tour skip action if the tour can be skipped', () => {
            TourService.canSkip = () => true;
            tourContainer.componentDidMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(true);
        });

        it('should not call the tour skip action if the tour cannot be skipped', () => {
            TourService.canSkip = () => false;
            tourContainer.componentDidMount();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('componentWillReceiveProps()', () => {
        beforeEach(() => {
            tourContainer.maybeSkipTour = jest.fn();
            tourContainer.maybeStartTour = jest.fn();
        });

        it('should call maybeSkipTour() with nextProps', () => {
            const spy = jest.spyOn(tourContainer, 'maybeSkipTour');
            const nextProps = {isSkipped: true};

            tourContainer.componentWillReceiveProps(nextProps);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(nextProps);
        });

        it('should call maybeStartTour() with nextProps', () => {
            const spy = jest.spyOn(tourContainer, 'maybeStartTour');
            const nextProps = {playing: true};

            tourContainer.componentWillReceiveProps(nextProps);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(nextProps);
        });
    });

    describe('maybeSkipTour()', () => {
        let spy;

        beforeEach(() => {
            spy = jest.spyOn(tourContainer, 'skipTour');
        });

        it('should call skipTour() if the isSkipped prop has changed and is true', () => {
            tourContainer.maybeSkipTour({isSkipped: true});

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should not call skipTour() if the isSkipped prop is false', () => {
            tourContainer.maybeSkipTour({isSkipped: false});
            expect(spy).not.toHaveBeenCalled();
        });

        it('should not call skipTour() if the isSkipped prop has not changed', () => {
            tourContainer.maybeSkipTour({});
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('maybeStartTour()', () => {
        beforeEach(() => {
            tourContainer.initializeTour = jest.fn();
        });

        it('should initialize the tour if the user-entered status has changed to true', () => {
            const spy = jest.spyOn(tourContainer, 'initializeTour');

            tourContainer.props = {playing: false};
            tourContainer.maybeStartTour({playing: true});

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should initialize the tour if the user-entered status is false', () => {
            const spy = jest.spyOn(tourContainer, 'initializeTour');

            tourContainer.maybeStartTour({playing: false});

            expect(spy).not.toHaveBeenCalled();
        });

        it('should not initialize the tour if it has already been initialized', () => {
            const spy = jest.spyOn(tourContainer, 'initializeTour');

            tourContainer.props = {playing: true};
            tourContainer.maybeStartTour({playing: true});

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('shouldRunTour()', () => {
        describe('when user has entered scene', () => {
            beforeEach(() => {
                tourContainer.props = {
                    playing: true
                };
            });

            it('should return true when not skipped', () => {
                tourContainer.props.isSkipped = false;
                expect(tourContainer.shouldRunTour()).toBe(true);
            });

            it('should return false when skipped', () => {
                tourContainer.props.isSkipped = true;
                expect(tourContainer.shouldRunTour()).toBe(false);
            });
        });

        describe('when user has not yet entered scene', () => {
            it('should return false', () => {
                tourContainer.props = {
                    playing: false,
                    isSkipped: false
                };
                expect(tourContainer.shouldRunTour()).toBe(false);
            });
        });
    });

    describe('initializeTour()', () => {
        beforeEach(() => {
            tourContainer.getTourDuration = jest.fn();
            TourService.canSkip = () => false;
        });

        describe('when the tour cannot be skipped', () => {
            it('should call setUIControls with false', () => {
                const spy = jest.spyOn(tourContainer.props.action, 'setUIControls');

                tourContainer.initializeTour();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(false);
            });

            it('should call setCameraOrbit with true', () => {
                const spy = jest.spyOn(tourContainer.props.action, 'setCameraOrbit');

                tourContainer.initializeTour();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(true);
            });

            it('should call onOrbitComplete after the calculated duration has passed', () => {
                tourContainer.onOrbitComplete = jest.fn();
                const spy = jest.spyOn(tourContainer, 'onOrbitComplete');

                tourContainer.initializeTour();

                expect(spy).not.toHaveBeenCalled();

                jest.runAllTimers();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
            });
        });

        describe('when the tour can be skipped', () => {
            beforeEach(() => {
                TourService.canSkip = () => true;
            });

            it('should not call setCameraOrbit with true', () => {
                const spy = jest.spyOn(tourContainer.props.action, 'setCameraOrbit');

                tourContainer.initializeTour();
                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('onOrbitComplete()', () => {
        beforeEach(() => {
            tourContainer.setDefaultActiveOrbital = jest.fn();
        });

        it('should call setActiveOrbital with the default orbital name if tour is not completed', () => {
            const spy = jest.spyOn(tourContainer, 'setDefaultActiveOrbital');

            tourContainer.props = {isComplete: false};
            tourContainer.onOrbitComplete();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should not call setActiveOrbital if tour is completed', () => {
            const spy = jest.spyOn(tourContainer, 'setDefaultActiveOrbital');

            tourContainer.props = {isComplete: true};
            tourContainer.onOrbitComplete();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('onTourComplete()', () => {
        it('should call tourCompleted with true', () => {
            const spy = jest.spyOn(tourContainer.props.action, 'tourCompleted');

            tourContainer.onTourComplete();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(true);
        });
    });

    describe('skipTour()', () => {
        it('should call the tourCompleted action with `true`', () => {
            const spy = jest.spyOn(tourContainer.props.action, 'tourCompleted');

            tourContainer.skipTour();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(true);
        });

        it('should call the setCameraOrbit action with `false`', () => {
            const spy = jest.spyOn(tourContainer.props.action, 'setCameraOrbit');

            tourContainer.skipTour();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(false);
        });

        it('should call setDefaultActiveOrbital()', () => {
            const spy = jest.spyOn(tourContainer, 'setDefaultActiveOrbital');

            tourContainer.skipTour();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('setDefaultActiveOrbital()', () => {
        it('should call the setActiveOrbital action with the alternate and default orbitals', () => {
            const spy = jest.spyOn(tourContainer.props.action, 'setActiveOrbital');

            tourContainer.setDefaultActiveOrbital();

            setTimeout(() => {
                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(2);
                expect(spy).toHaveBeenCalledWith(...Constants.UI.Targets.ALTERNATE);
                expect(spy).toHaveBeenCalledWith(...Constants.UI.Targets.DEFAULT);
            });
        });
    });

    describe('skipTourTrigger()', () => {
        it('should call skipTour()', () => {
            const spy = jest.spyOn(tourContainer, 'skipTour');

            tourContainer.skipTourTrigger();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('getLabels()', () => {
        it('should return an array of TourLabels', () => {
            const result = tourContainer.getLabels(labels);

            expect(Array.isArray(result)).toBe(true);

            result.forEach((label) => {
                expect(label).toMatchSnapshot();
            });
        });
    });

    describe('render()', () => {
        it('should return null when tour cannot be run', () => {
            tourContainer.shouldRunTour = () => false;
            tourContainer.render();

            expect(toJson(component)).toEqual(null);
        });

        it('should render the tour container successfully when tour can be run', () => {
            tourContainer.shouldRunTour = () => true;
            tourContainer.render();

            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
