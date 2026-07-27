import * as Actions from '../TourActions'
import ActionType from '../../constants/Actions'

describe('Tour Actions', () => {
  describe('setCameraOrbit()', () => {
    it('should be of type SET_CAMERA_ORBIT with the isAutoOrbitEnabled payload', () => {
      const isAutoOrbitEnabled = true
      const result = Actions.setCameraOrbit(isAutoOrbitEnabled)

      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('isAutoOrbitEnabled')
      expect(result.type).toEqual(ActionType.SET_CAMERA_ORBIT)
      expect(result.isAutoOrbitEnabled).toEqual(isAutoOrbitEnabled)
    })
  })

  describe('tourCompleted()', () => {
    it('should be of type TOUR_COMPLETED with the isComplete payload', () => {
      const isComplete = true
      const result = Actions.tourCompleted(isComplete)

      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('isComplete')
      expect(result.type).toEqual(ActionType.TOUR_COMPLETED)
      expect(result.isComplete).toEqual(isComplete)
    })
  })
})
