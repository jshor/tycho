import React from 'react';
import moment from 'moment';
import toJson from 'enzyme-to-json';
import {shallow} from 'enzyme';
import DatePickerContainer from '../DatePickerContainer';

describe('DatePicker Container', () => {
    let component;
    let datePicker;

    beforeEach(() => {
        component = shallow(
            <DatePickerContainer
                time={1}
                onUpdate={jest.fn()}
            />
        );

        datePicker = component.instance();
    });

    describe('componentWillReceiveProps()', () => {
        it('should set uxTime and realTime state values if the calendar is not open', () => {
            const uxTime = '11/11/1111';
            const realTime = 123456;

            component.setState({uxTime, realTime});
            component.setProps({time: 54321});

            expect(component.state('uxTime')).not.toEqual(uxTime);
            expect(component.state('realTime')).not.toEqual(realTime);
        });

        it('should not change uxTime or realTime state values if the calendar is already open', () => {
            const uxTime = '11/11/1111';
            const realTime = 123456;

            datePicker.isOpen = true;
            component.setState({uxTime, realTime});
            component.setProps({time: 54321});

            expect(component.state('uxTime')).toEqual(uxTime);
            expect(component.state('realTime')).toEqual(realTime);
        });
    });

    describe('getUXTime()', () => {
        it('should return a string', () => {
            const result = datePicker.getUXTime(moment());

            expect(typeof result).toBe('string');
        });
    });

    describe('shouldComponentUpdate()', () => {
        it('should return the inverse of isOpen', () => {
            const result = datePicker.shouldComponentUpdate();

            expect(typeof result).toBe('boolean');
            expect(result).toEqual(!datePicker.isOpen);
        });
    });

    describe('hidePicker()', () => {
        it('should set isOpen to false', () => {
            datePicker.isOpen = true;
            datePicker.hidePicker();

            expect(datePicker.isOpen).toEqual(false);
        });
    });

    describe('showPicker()', () => {
        let picker;
        let spy;

        beforeEach(() => {
            picker = {openCalendar: jest.fn()};
            spy = jest.spyOn(picker, 'openCalendar');
        });

        it('should open the calendar if its ref is defined', () => {
            datePicker.refs = {picker};
            datePicker.showPicker();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should not open the calendar if its ref is undefined', () => {
            datePicker.refs = {};
            datePicker.showPicker();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('changeTime()', () => {
        it('should call the onUpdate prop method with the given unix time', () => {
            datePicker.props = {onUpdate: jest.fn()};

            const time = moment();
            const spy = jest.spyOn(datePicker.props, 'onUpdate');

            datePicker.changeTime(time);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(time.unix());
        });
    });

    describe('render()', () => {
        it('should render the DatePicker component successfully', () => {
            component.setState({realTime: 123456});

            expect(toJson(component)).toMatchSnapshot();
        });
    });
});
