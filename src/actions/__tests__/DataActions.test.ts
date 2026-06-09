import * as Actions from '../DataActions';
import ActionType from '../../constants/Actions';
import orbitalFixtures from './__fixtures__/orbitals.json';
import pageTextFixtures from './__fixtures__/pageText.json';

const mockJsonFetch = (jsonData) => {
    return jest.fn()
        .mockImplementation(() => {
            return new Promise((resolve) => {
                resolve({
                    json: () => jsonData
                });
            });
        });
}

describe('Data Actions', () => {
    describe('requestOrbitalData()', () => {
        beforeEach(() => {
            global.fetch = mockJsonFetch(orbitalFixtures);
        });

        it('should be a thunk', () => {
            expect(typeof Actions.requestOrbitalData()).toBe('function');
        });

        it('should request orbitals.json', () => {
            const dispatch = (data) => {
                expect(data).toEqual({
                    type: ActionType.SET_ORBITAL_DATA,
                    orbitalData: orbitalFixtures
                });
            };
            Actions.requestOrbitalData()(dispatch);
        });
    });

    describe('requestPageText()', () => {
        beforeEach(() => {
            global.fetch = mockJsonFetch(pageTextFixtures);
        });

        it('should be a thunk', () => {
            expect(typeof Actions.requestPageText()).toBe('function');
        });

        it('should request pageText.json', () => {
            const dispatch = (data) => {
                expect(data).toEqual({
                    type: ActionType.SET_PAGE_TEXT,
                    pageText: pageTextFixtures
                });
            };
            Actions.requestPageText()(dispatch);
        });
    });
});

