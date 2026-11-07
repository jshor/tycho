import { describeSpeed, focusById, prefersReducedMotion, recoverFocus } from '../a11y'
import { Constants } from '../../constants'

describe('a11y', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  const stubFrame = () =>
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })

  describe('prefersReducedMotion()', () => {
    it('should report the motion preference the system holds', () => {
      vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))

      expect(prefersReducedMotion()).toBe(true)
    })

    it('should report no preference where the system cannot be asked', () => {
      vi.stubGlobal('matchMedia', undefined)

      expect(prefersReducedMotion()).toBe(false)
    })
  })

  describe('describeSpeed()', () => {
    it('should read real time out as such', () => {
      expect(describeSpeed(0)).toEqual('1× real time')
    })

    it('should read out the power of ten in full, grouped in thousands', () => {
      expect(describeSpeed(5)).toEqual('100,000× real time')
    })
  })

  describe('focusById()', () => {
    it('should hand the focus to the element having the given ID once the frame has drawn', () => {
      stubFrame()
      document.body.innerHTML = '<button id="there">There</button>'

      focusById('there')

      expect(document.activeElement?.id).toEqual('there')
    })

    it('should do nothing when there is no such element', () => {
      stubFrame()

      expect(() => focusById('nowhere')).not.toThrow()
    })
  })

  describe('recoverFocus()', () => {
    beforeEach(() => {
      stubFrame()
      document.body.innerHTML = `
        <div id="${Constants.UI.SCENE_ID}" tabindex="0"></div>
        <button id="elsewhere">Elsewhere</button>
      `
    })

    it('should hand a focus that dropped out of the page to the scene', () => {
      recoverFocus()

      expect(document.activeElement?.id).toEqual(Constants.UI.SCENE_ID)
    })

    it('should leave a focus that something else has taken where it is', () => {
      document.getElementById('elsewhere')?.focus()

      recoverFocus()

      expect(document.activeElement?.id).toEqual('elsewhere')
    })
  })
})
