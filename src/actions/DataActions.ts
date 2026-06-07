import { Dispatch } from 'redux';
// redux 3.x Dispatch<S> requires a type argument
type AnyDispatch = Dispatch<any>;
import Actions from '../constants/Actions';
import { OrbitalData, PageText } from '../types';
import { env } from '../utils/Environment';

export const requestOrbitalData = () => (dispatch: AnyDispatch) => {
    return fetch(env('/static/data/orbitals.json'))
        .then((res) => res.json())
        .then((orbitalData: OrbitalData[]) => {
            dispatch({
                type: Actions.SET_ORBITAL_DATA,
                orbitalData
            });
        });
};

export const requestPageText = () => (dispatch: AnyDispatch) => {
    return fetch(env('/static/data/pageText.json'))
        .then((res) => res.json())
        .then((pageText: PageText) => {
            dispatch({
                type: Actions.SET_PAGE_TEXT,
                pageText
            });
        });
};
