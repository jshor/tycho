import React from 'react';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import Modal from './';

describe('Modal Component', () => {
    let component;

    beforeEach(() => {
        component = shallow(
            <Modal
                closeModal={jest.fn()}
                title="Test Modal"
                description="Test Description"
            />
        );
    });

    it('should render the Modal successfully', () => {
        expect(toJson(component)).toMatchSnapshot();
    });
});
