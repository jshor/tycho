import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Stats from './Stats';

describe('Stats', () => {
    const pageText = {
        stats: {},
        abbreviations: {}
    };

    it('should render the stats component with a blank description', () => {
        const component = shallow(<Stats
            pageText={pageText}
            description="Hello, world."
        />);
        expect(toJson(component)).toMatchSnapshot();
    });

    it('should render the stats component with the given description', () => {
        const component = shallow(<Stats pageText={pageText} />);
        expect(toJson(component)).toMatchSnapshot();
    });
});