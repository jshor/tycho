import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import NoWebGL from './';

describe('No WebGL Warning Component', () => {
    let component;

    beforeEach(() => {
        component = shallow(
            <NoWebGL pageText={{
                webgl: {
                    noWebGl: 'WebGL not enabled.',
                    required: 'WebGL is required to run this experiment.',
                    clickHere: 'Click here',
                    learn: 'Learn more.',
                    enableInstructionsUrl: 'https://get.webgl.org/webgl2/enable.html'
                }
            }} />
        );
    });

    it('should render the message successfully', () => {
        expect(toJson(component)).toMatchSnapshot();
    });
});
