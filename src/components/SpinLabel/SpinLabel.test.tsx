import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import SpinLabel from './SpinLabel';

describe('SpinLabel Component', () => {
    describe('render()', () => {    
        it('should render the spin label with the `hide` class modifier if the show prop is false', () => {
            const component = shallow(<SpinLabel show={false} count={4} />);
      
            expect(toJson(component)).toMatchSnapshot();
            expect(component.find('.spin-container').hasClass('spin-container--hide')).toBe(true);
        });

        it('should render the spin label with the `show` class modifier if the show prop is true', () => {
            const component = shallow(<SpinLabel show={true} count={4} />);
      
            expect(toJson(component)).toMatchSnapshot();
            expect(component.find('.spin-container').hasClass('spin-container--show')).toBe(true);
        });
    });
});
