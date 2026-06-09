import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import {AppContainer} from '../AppContainer';

describe('App Container', () => {
    let component;
    let appContainer;

    const action = {
        requestOrbitalData: jest.fn(),
        requestPageText: jest.fn(),
        setTime: jest.fn()
    };

    beforeEach(() => {
        component = shallow(<AppContainer action={action} />);
        appContainer = component.instance();
    });

    describe('componentWillReceiveProps()', () => {
        it('should call maybeUpdateOffset()', () => {
            const spy = jest.spyOn(appContainer, 'maybeUpdateOffset');
            const nextProps = {};

            appContainer.componentWillReceiveProps(nextProps);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('maybeUpdateOffset()', () => {
        it('should update the clock offset if scene is playing', () => {

            const spy = jest.spyOn(appContainer.clock, 'setOffset');
            const timeOffset = 123;

            appContainer.props = {playing: true};
            appContainer.maybeUpdateOffset({timeOffset});

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(timeOffset);
        });

        it('should not update the clock if offset not undefined', () => {
            const spy = jest.spyOn(appContainer.clock, 'setOffset');
            const timeOffset = undefined;

            appContainer.props = {playing: true};
            appContainer.maybeUpdateOffset({timeOffset});

            expect(spy).not.toHaveBeenCalled();
        });

        it('should not update the clock if scene is paused', () => {
            const spy = jest.spyOn(appContainer.clock, 'setOffset');
            const timeOffset = 123;

            appContainer.props = {playing: false};
            appContainer.maybeUpdateOffset({timeOffset});

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('maybeUpdateTime()', () => {
        const time = 1;

        beforeEach(() => {
            appContainer.props = {
                action: {
                    setTime: jest.fn()
                }
            };
            appContainer.clock = {
                getTime: () => time
            };
        });

        it('should update the global time to the clock\'s current time when changed', () => {
            const spy = jest.spyOn(appContainer.props.action, 'setTime');

            appContainer.shouldUpdateTime = () => true;
            appContainer.maybeUpdateTime();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1)
            expect(spy).toHaveBeenCalledWith(time);
        });

        it('should update the global time to the clock\'s current time when forced to', () => {
            const spy = jest.spyOn(appContainer.props.action, 'setTime');

            appContainer.shouldUpdateTime = () => false;
            appContainer.maybeUpdateTime(true);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1)
            expect(spy).toHaveBeenCalledWith(time);
        });

        it('should update the global time if not changed and not forced to', () => {
            const spy = jest.spyOn(appContainer.props.action, 'setTime');

            appContainer.shouldUpdateTime = () => false;
            appContainer.maybeUpdateTime(false);

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('maybeContinue()', () => {
        beforeEach(() => {
            appContainer.clock = {
                continue: jest.fn()
            };
            appContainer.props = {};
        });

        describe('when the scene is playing', () => {
            beforeEach(() => {
                appContainer.props.playing = true;
            });

            it('should call continue() on the clock if the clock is stopped', () => {
                const spy = jest.spyOn(appContainer.clock, 'continue');

                appContainer.clock.stopped = true;
                appContainer.maybeContinue();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
            });

            it('should not call continue() on the clock if the clock is running', () => {
                const spy = jest.spyOn(appContainer.clock, 'continue');

                appContainer.clock.stopped = false;
                appContainer.maybeContinue();

                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('when the scene is paused', () => {
            it('should not call continue() on the clock', () => {
                const spy = jest.spyOn(appContainer.clock, 'continue');

                appContainer.props.playing = false;
                appContainer.maybeContinue();

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('maybeStop()', () => {
        beforeEach(() => {
            appContainer.clock = {
                stop: jest.fn()
            };
            appContainer.props = {};
        });

        describe('when the scene is playing', () => {
            beforeEach(() => {
                appContainer.props.playing = false;
            });

            it('should call stop() on the clock if the clock is running', () => {
                const spy = jest.spyOn(appContainer.clock, 'stop');

                appContainer.clock.stopped = false;
                appContainer.maybeStop();

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
            });

            it('should not call stop() on the clock if the clock is already stopped', () => {
                const spy = jest.spyOn(appContainer.clock, 'stop');

                appContainer.clock.stopped = true;
                appContainer.maybeStop();

                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('when the scene is playing', () => {
            it('should not call stop() on the clock', () => {
                const spy = jest.spyOn(appContainer.clock, 'stop');

                appContainer.props.playing = true;
                appContainer.maybeStop();

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });
    describe('shouldUpdateTime()', () => {
        const time = 1;

        beforeEach(() => {
            appContainer.clock = {
                getTime: () => time
            };
        });

        describe('when the time has changed since last update', () => {
            beforeEach(() => {
                appContainer.lastTime = time + 1;
            });

            it('should return true if scene is playing', () => {
                appContainer.props = {playing: true};

                const result = appContainer.shouldUpdateTime();

                expect(typeof result).toBe('boolean');
                expect(result).toEqual(true);
            });

            it('should return false if scene is paused', () => {
                appContainer.props = {playing: false};

                const result = appContainer.shouldUpdateTime();

                expect(typeof result).toBe('boolean');
                expect(result).toEqual(false);
            });
        });

        describe('when the time is the same as when last probed', () => {
            it('should return false', () => {
                appContainer.lastTime = time;
                const result = appContainer.shouldUpdateTime();

                expect(typeof result).toBe('boolean');
                expect(result).toEqual(false);
            });
        });
    });

    describe('onAnimate()', () => {
        beforeEach(() => {
            appContainer.props = {
                action: {setTime: jest.fn()}
            };
        });

        it('should update the clock speed', () => {
            const speed = 2;
            const spy = jest.spyOn(appContainer.clock, 'speed');

            appContainer.props.speed = speed;
            appContainer.onAnimate();

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('render()', () => {
        it('should render the splash screen if orbitalData is undefined', () => {
            component = shallow(<AppContainer
                pageText={{}}
                action={action}
            />);
            expect(toJson(component)).toMatchSnapshot();
        });

        it('should render the splash screen if pageText is undefined', () => {
            component = shallow(<AppContainer
                orbitalData={{}}
                action={action}
            />);
            expect(toJson(component)).toMatchSnapshot();
        });

        it('should render the app successfully', () => {
            component = shallow(<AppContainer
                orbitalData={{}}
                pageText={{}}
                action={action}
            />);
            component.setState({time: 1});
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
