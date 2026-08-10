import { Constants } from '../constants'

export const Scale = (radius: number): number => {
  return radius / Constants.WebGL.UNIT_SCALE
}
