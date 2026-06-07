import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import SplashScreen from './SplashScreen';

describe('SplashScreen Component', () => {
    let component;
    let splashScreen;

    beforeEach(() => {
        component = shallow(<SplashScreen
            pageText={{}}
            percent={1}
            enterScene={jest.fn()}
        />);

        splashScreen = component.instance();
        splashScreen.props = {
            pageText: {}
        };
    });

    describe('renderEnterButton()', () => {
        it('should render the enter button', () => {
            const result = toJson(splashScreen.renderEnterButton());

            expect(result).toMatchSnapshot();
        });
    });

    describe('renderLoadingBar()', () => {
        it('should render the enter button', () => {
            const result = toJson(splashScreen.renderLoadingBar());

            expect(result).toMatchSnapshot();
        });
    });

    describe('renderUserPrompt()', () => {
        it('should render the enter button if percent is 100', () => {
            splashScreen.props.percent = 100;
            const result = toJson(splashScreen.renderUserPrompt());

            expect(result).toMatchSnapshot();
        });

        it('should render the loading bar if percent is not 100', () => {
            splashScreen.props.percent = 50;
            const result = toJson(splashScreen.renderUserPrompt());

            expect(result).toMatchSnapshot();
        });
    });

    describe('render()', () => {
        it('should render the Splash Screen successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
