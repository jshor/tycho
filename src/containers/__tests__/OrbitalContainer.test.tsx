import React from 'react'
import { Vector3 } from 'three'
import { act } from '@testing-library/react'
import { renderWithStore } from '../../test/render'
import data from './__fixtures__/orbitals.json'
import { OrbitalContainer } from '../OrbitalContainer'
import { Mutable } from '../../test/helpers'
import OrbitalService from '../../services/OrbitalService'
import Ellipse from '../../utils/Ellipse'
import Constants from '../../constants'

const action = {
  setActiveOrbital: vi.fn(),
  addHighlightedOrbital: vi.fn(),
  removeHighlightedOrbital: vi.fn()
}

describe('Orbital Container', () => {
  let ref: React.RefObject<OrbitalContainer>

  beforeEach(() => {
    vi.clearAllMocks()
    ref = React.createRef<OrbitalContainer>()
    renderWithStore(<OrbitalContainer {...data[0]} time={1} action={action} ref={ref} />)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('constructor()', () => {
    it('should initialize an Ellipse instance', () => {
      expect(ref.current?.ellipse).toBeInstanceOf(Ellipse)
    })

    it('should initialize group rotations in state', () => {
      expect(ref.current?.state).toHaveProperty('eclipticGroupRotation')
      expect(ref.current?.state).toHaveProperty('orbitalGroupRotation')
    })

    it('should initialize body state', () => {
      expect(ref.current?.state).toHaveProperty('bodyPosition')
      expect(ref.current?.state).toHaveProperty('bodyRotation')
    })
  })

  describe('componentDidUpdate()', () => {
    it('should call maybeUpdateBodyState()', () => {
      const container = ref.current
      const spy = vi.spyOn(container, 'maybeUpdateBodyState')

      container.componentDidUpdate({ ...data[0] })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should call maybeUpdatePathOpacity()', () => {
      const container = ref.current
      const spy = vi.spyOn(container, 'maybeUpdatePathOpacity')

      container.componentDidUpdate({ ...data[0] })

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('maybeUpdateBodyState()', () => {
    it('should call setBodyState() when time has changed', () => {
      const container = ref.current as Mutable<OrbitalContainer>
      container.setBodyState = vi.fn()

      const spy = vi.spyOn(container, 'setBodyState')
      container.props = { ...data[0], time: 2 }
      container.maybeUpdateBodyState({ ...data[0], time: 1 })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should not call setBodyState() when time is unchanged', () => {
      const container = ref.current as Mutable<OrbitalContainer>
      container.setBodyState = vi.fn()

      const spy = vi.spyOn(container, 'setBodyState')
      container.props = { ...data[0], time: 1 }
      container.maybeUpdateBodyState({ ...data[0], time: 1 })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('maybeUpdatePathOpacity()', () => {
    it('should call setPathOpacity() when highlightedOrbitals changes', () => {
      const container = ref.current as Mutable<OrbitalContainer>
      container.setPathOpacity = vi.fn()

      const spy = vi.spyOn(container, 'setPathOpacity')
      container.props = {
        ...data[0],
        highlightedOrbitals: ['Mars']
      }
      container.maybeUpdatePathOpacity({ ...data[0], highlightedOrbitals: ['Earth'] })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should not call setPathOpacity() when highlightedOrbitals is unchanged', () => {
      const container = ref.current as Mutable<OrbitalContainer>
      container.setPathOpacity = vi.fn()

      const spy = vi.spyOn(container, 'setPathOpacity')
      const list = ['Mars']
      container.props = { ...data[0], highlightedOrbitals: list }
      container.maybeUpdatePathOpacity({ ...data[0], highlightedOrbitals: list })

      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('maybeUpdateScale()', () => {
    const scale = 2
    const time = 12345

    beforeEach(() => {
      const current = ref.current as Mutable<OrbitalContainer>

      current.setBodyState = vi.fn()
      current.props = { ...data[0], scale: scale + 1 }
    })

    it('should update the ellipse scale when orbital is a satellite', () => {
      const container = ref.current as Mutable<OrbitalContainer>
      const spy = vi.spyOn(container.ellipse, 'setScale')

      container.props = {
        ...data[0],
        scale: scale + 1,
        isSatellite: true
      }
      container.maybeUpdateScale({ ...data[0], scale, time })

      expect(spy).toHaveBeenCalledWith(scale + 1)
    })

    it('should not mutate the ellipse scale for non-satellites', () => {
      const container = ref.current as Mutable<OrbitalContainer>
      const spy = vi.spyOn(container.ellipse, 'setScale')

      container.props = {
        ...data[0],
        scale: scale + 1,
        isSatellite: false
      }
      container.maybeUpdateScale({ ...data[0], scale, time })

      expect(spy).not.toHaveBeenCalled()
    })

    it('should update the body state after scale changes', () => {
      const container = ref.current
      const spy = vi.spyOn(container, 'setBodyState')

      container.maybeUpdateScale({ ...data[0], scale, time })

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('setPathOpacity()', () => {
    it('should update pathOpacity state', () => {
      const container = ref.current
      const opacity = Constants.UI.HOVER_OPACITY_ON
      OrbitalService.getPathOpacity = () => opacity

      act(() => {
        container.setPathOpacity({ ...data[0] }, ['Earth'])
      })

      expect(container.state.pathOpacity).toBe(opacity)
    })
  })

  describe('setGroupRotations()', () => {
    it('should set eclipticGroupRotation and orbitalGroupRotation in state', () => {
      ref.current?.setGroupRotations(ref.current?.props)

      expect(ref.current?.state).toHaveProperty('eclipticGroupRotation')
      expect(ref.current?.state).toHaveProperty('orbitalGroupRotation')
    })
  })

  describe('setBodyState()', () => {
    it('should set bodyPosition and bodyRotation in state', () => {
      OrbitalService.getBodyPosition = () => new Vector3()
      ref.current?.setBodyState(ref.current?.props, ref.current?.ellipse)

      expect(ref.current?.state).toHaveProperty('bodyPosition')
      expect(ref.current?.state).toHaveProperty('bodyRotation')
    })
  })
})
