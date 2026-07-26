import { bindActionCreators, Dispatch } from 'redux'

export default class ReduxService {
  static mapStateToProps = (...props: string[]) => {
    return (state: Record<string, any>): Record<string, any> => {
      const data: Record<string, any> = {}

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
      return data
    }
  }

  static mapDispatchToProps = (...actions: Record<string, any>[]) => {
    const allActions = actions.reduce((cur, next) => Object.assign(cur, next), {})

    return (dispatch: Dispatch<any>) => ({
      action: bindActionCreators(allActions, dispatch)
    })
  }

  static assign = (
    state: Record<string, any>,
    payload: Record<string, any>,
    ...props: string[]
  ): Record<string, any> => {
    const data: Record<string, any> = {}

    props.forEach((prop) => {
      data[prop] = payload[prop]
    })

    return Object.assign({}, state, data)
  }
}
