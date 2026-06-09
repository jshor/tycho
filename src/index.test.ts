import index from './index.js';

jest.mock('./containers/AppContainer');

describe('Main Entry', () => {
    it('should render without crashing', () => {
        expect(index).toBeTruthy();
    });
});
