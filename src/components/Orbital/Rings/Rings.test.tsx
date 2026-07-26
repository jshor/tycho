import React from 'react'
import { render } from '@testing-library/react'
import Rings from './Rings'

describe('Rings Component', () => {
  it('should render without crashing', () => {
    const props: any = { outerRadius: 2000, barycenterTilt: 27, maps: [], scale: 1 }
    expect(() => render(<Rings {...props} />)).not.toThrow()
  })
})
