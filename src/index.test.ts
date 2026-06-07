import * as index from './index';

jest.mock('./containers/AppContainer');

describe('Main Entry', () => {
    it('should render without crashing', () => {
        expect(index).toBeTruthy();
    });
});
