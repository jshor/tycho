import { Scale } from '../scale'

describe('Scale', () => {
  it('should be a number', () => {
    const result = Scale(5)
    expect(typeof result).toBe('number')
  })
})
