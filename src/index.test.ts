import { createRoot } from 'react-dom/client'

describe('Entry point', () => {
  it('should import createRoot from react-dom/client', () => {
    expect(typeof createRoot).toBe('function')
  })
})
