import React from 'react';
import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';
import {PlayPauseContainer} from '../PlayPauseContainer';

describe('Orbital Container', () => {
    let component;
    let playPauseContainer;

    beforeEach(() => {
        component = shallow(<PlayPauseContainer />);

        playPauseContainer = component.instance();
    });

    describe('togglePlayer()', () => {
        it('should call setPlayer with the inverse of the playing prop value', () => {
            const playing = true;

            playPauseContainer.props = {
                action: {
                    setPlaying: jest.fn()
                },
                playing
            };

            const spy = jest.spyOn(playPauseContainer.props.action, 'setPlaying');

            playPauseContainer.togglePlayer();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(!playing);
        });
    });

    describe('render()', () => {
        it('should render the PlayPause container successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
