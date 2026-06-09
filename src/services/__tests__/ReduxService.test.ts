import ReduxService from '../ReduxService';

describe('Redux Service', () => {
    describe('mapStateToProps()', () => {
        it('should return a function', () => {
            expect(typeof ReduxService.mapStateToProps).toBe('function');
        });

        it('should assign all properties from the given reducer to the returned prop object', () => {
            const reducer = 'foo';
            const props = [
                'foo.bar',
                'foo.baz',
                'bar.foo'
            ];
            const bar = 'test1';
            const baz = 'test2';
            const state = {
                [reducer]: {bar, baz}
            };

            const mapStateToProps = ReduxService.mapStateToProps(reducer, ...props);
            const result = mapStateToProps(state);

            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('bar');
            expect(result).toHaveProperty('baz');
            expect(result.bar).toEqual(bar);
            expect(result.baz).toEqual(baz);
        });
    });

    describe('mapDispatchToProps()', () => {
        const actions = {
            test: jest.fn()
        };

        it('should return a function', () => {
            const result = ReduxService.mapDispatchToProps(actions);
      
            expect(typeof result).toBe('function');
        });

        it('should return property `action` having `bindActionCreators`', () => {
            const result = ReduxService.mapDispatchToProps(actions)();

            expect(typeof result).toBe('object');
            expect(result).toHaveProperty('action');
            expect(typeof result.action).toBe('object');
        });
    });

    describe('assign()', () => {
        it('should return an object', () => {
            const result = ReduxService.assign();

            expect(typeof result).toBe('object');
        });

        it('should assign the given payload prop values to state', () => {
            const state = {foo: 'bar'};
            const payload = {baz: 'bat'};
            const result = ReduxService.assign(state, payload, 'baz');

            expect(result).toHaveProperty('foo');
            expect(result).toHaveProperty('baz');
        });
    });
});
