import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import Label from './Label';

jest.mock('three-dom-label', () => {
    return function (settings) {
        this.unmount = jest.fn();
        this.setClass = jest.fn();

        Object.assign(this, settings);
    }
});

describe('Orbital Label Component', () => {
    let component;
    let label;

    beforeEach(() => {
        component = shallow(
            <Label
                action={{
                    setActiveOrbital: jest.fn(),
                    addHighlightedOrbital: jest.fn(),
                    removeHighlightedOrbital: jest.fn()
                }}
                text="Test Planet"
                id="testPlanet"
            />
        );
        label = component.instance();
    });

    describe('componentDidMount()', () => {
        beforeEach(() => {
            label.refs = {
                group: {
                    add: jest.fn()
                }
            };
        });

        it('should assign a new label', () => {
            label.componentDidMount();
            expect(label).toHaveProperty('label');
        });

        it('should add the label to the group', () => {
            const spy = jest.spyOn(label.refs.group, 'add');

            label.componentDidMount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith(label.label);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('componentWillUnmount()', () => {
        beforeEach(() => {
            label.label = { unmount: jest.fn() };
        });

        it('should unmount the DOM label', () => {
            const spy = jest.spyOn(label.label, 'unmount');

            label.componentWillUnmount();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('componentWillReceiveProps()', () => {
        it('should call maybeUpdateClassName() with nextProps', () => {
            const targetId = 'testPlanet';
            const nextProps = { targetId };
            const spy = jest.spyOn(label, 'maybeUpdateClassName');

            label.props = { targetId };
            label.componentWillReceiveProps(nextProps);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(nextProps);
        });
    });

    describe('maybeUpdateClassName()', () => {
        let spy;
        const id = 'Earth';
        const targetId = 'Mars';

        beforeEach(() => {
            label.props = { targetId };
            label.label = {
                setClass: jest.fn()
            };
            spy = jest.spyOn(label.label, 'setClass');
        });

        describe('when the targetId has changed', () => {
            it('should set the class suffix to \'inactive\' when the targetId does not match the label id', () => {
                label.maybeUpdateClassName({id, targetId: 'Jupiter'});

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith('label label--inactive');
            });

            it('should set the class suffix to \'active\' when the targetId matches the label id', () => {
                label.maybeUpdateClassName({id, targetId: id});

                expect(spy).toHaveBeenCalled();
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith('label label--active');
            });
        });

        describe('when the targetId has not changed', () => {
            it('should not change the class name', () => {
                label.maybeUpdateClassName({ id, targetId });

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('getLabel()', () => {
        let result;
        const text = 'Test Label';
        const id = 'testPlanet';

        beforeEach(() => {
            const action = {
                setActiveOrbital: jest.fn(),
                addHighlightedOrbital: jest.fn(),
                removeHighlightedOrbital: jest.fn()
            };

            label.props = { text, id, action };
            result = label.getLabel();
        });

        it('should pass the text property to the label', () => {

            expect(result).toHaveProperty('text');
            expect(result.text).toEqual(text);
        });

        it('should pass the id property to the label', () => {
            expect(result).toHaveProperty('id');
            expect(result.id).toEqual(id);
        });

        it('should set the className to the \'inactive\' label class', () => {
            expect(result).toHaveProperty('className');
            expect(result.className).toEqual('label label--inactive');
        });
    });

    it('should render the markdown container successfully', () => {
        expect(toJson(component)).toMatchSnapshot();
    });
});
