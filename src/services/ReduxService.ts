import { bindActionCreators } from 'redux';

export default class ReduxService {

    /**
     * Returns a `mapStateToProps` function for Redux.
     * This will map the props from the given reducer name to an object and return it.
     *
     * @param {String} reducer - name of reducer in state
     * @param {...String} props - list of prop names to copy from the reducer
     * @returns {Function<Object>} new props to be assigned
     */
    static mapStateToProps = (...props) => {
        return function (state) {
            const data = {};

            props.forEach((prop) => {
                const path = prop.split('.');
                const reducer = path[0];
                const key = path[1];

                if (!data[reducer]) {
                    data[reducer] = {};
                }
                if (state[reducer]) {
                    data[key] = state[reducer][key];
                }
            });
            return data;
        }
    }

    /**
     * Returns a `mapDispatchToProps` function for Redux.
     * This will combine and convert the given actions to action creators.
     *
     * @param {Object} actions - key-value pair for action methods
     * @returns {Function<Object>}
     */
    static mapDispatchToProps = (...actions) => {
        // consolidate sets of actions into one object
        const allActions = actions.reduce((cur, next) => {
            return Object.assign(cur, next);
        }, {});

        return function (dispatch) {
            return {
                action: bindActionCreators(allActions, dispatch)
            };
        }
    }

    /**
     * Assigns the payload objects of the given list of props to state.
     * This returns a new copy of state with the mapping.
     *
     * @param {Object} state - current state
     * @param {Object} payload - payload data
     * @param {...String} props - list of keys to assign from
     * @return {Object} new assigned state
     */
    static assign = (state, payload, ...props) => {
        const data = {};

        props.forEach((prop) => {
            data[prop] = payload[prop];
        });

        return Object.assign({}, state, data);
    }
}
