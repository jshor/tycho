import { bindActionCreators, ActionCreatorsMapObject, AnyAction, Dispatch } from 'redux'

/** A bag of values keyed by name, whose value types are only known at runtime. */
type Props = Record<string, unknown>

export default class ReduxService {
  /**
   * Builds a `mapStateToProps` that pulls `'reducer.key'` paths out of the store.
   */
  static mapStateToProps = <S extends object = Props>(...props: string[]) => {
    return (state: Record<string, Props>): S => {
      const data: Props = {}

      props.forEach((prop) => {
        const path = prop.split('.')
        const reducer = path[0]
        const key = path[1]

        if (!data[reducer]) {
          data[reducer] = {}
        }
        if (state[reducer]) {
          data[key] = state[reducer][key]
        }
      })

      return data as S
    }
  }

  /**
   * Binds whole action modules to dispatch and exposes them under a single `action` prop.
   */
  static mapDispatchToProps = <A>(...actions: ActionCreatorsMapObject[]) => {
    const allActions = actions.reduce((cur, next) => Object.assign(cur, next), {})

    return (dispatch: Dispatch<AnyAction>): { action: A } => ({
      action: bindActionCreators(allActions, dispatch) as A
    })
  }

  /**
   * Copies the named properties off an action onto a shallow clone of the state.
   */
  static assign = <S extends object>(state: S, payload: AnyAction, ...props: string[]): S => {
    const data: Props = {}

    props.forEach((prop) => {
      data[prop] = payload[prop]
    })

    return Object.assign({}, state, data)
  }
}
