import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import App from './App';

describe('App Component', () => {
    let component;

    beforeEach(() => {
        component = shallow(<App
            onAnimate={jest.fn()}
            updateScreenPosition={jest.fn()}
            time={1}
            width={300}
            orbitalData={[]}
            positions={{}}
            height={500}
            pageText={{
                aboutTitle: 'About',
                aboutInfo: 'About this project'
            }}
        />);
    });

    describe('render()', () => {
        it('should render the app successfully', () => {
            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
