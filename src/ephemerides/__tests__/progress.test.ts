import readline from 'node:readline'
import { Progress } from '../progress'

vi.mock('node:readline', () => {
  const readline = {
    moveCursor: vi.fn(),
    cursorTo: vi.fn(),
    clearLine: vi.fn()
  }

  return { ...readline, default: readline }
})

const moveCursor = vi.mocked(readline.moveCursor)
const write = vi.fn<(chunk: string) => boolean>(() => true)
const lines = () => write.mock.calls.map(([chunk]) => chunk)
const lastRender = () => lines().slice(-2)
const BAR_WIDTH = 30
const bar = (filled: number) => '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)

describe('Progress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(process.stdout, 'write').mockImplementation(write as never)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  describe('update()', () => {
    it('should render the bar and the status on separate lines', () => {
      new Progress(10).update(5, 'Processing saturn.json...')

      expect(lastRender()).toEqual([`[${bar(15)}] 50%\n`, '🌎 Processing saturn.json...\n'])
    })

    it('should render an empty bar before any work is done', () => {
      new Progress(10).update(0, 'Starting...')

      expect(lines()[0]).toBe(`[${bar(0)}] 0%\n`)
    })

    it('should render a full bar on the last item', () => {
      new Progress(4).update(4, 'Done')

      expect(lines()[0]).toBe(`[${bar(30)}] 100%\n`)
    })

    it('should clamp the bar at 100% when current exceeds the total', () => {
      new Progress(4).update(9, 'Overshoot')

      expect(lines()[0]).toBe(`[${bar(30)}] 100%\n`)
    })

    it('should render 0% rather than NaN for an empty total', () => {
      new Progress(0).update(0, 'Nothing to do')

      expect(lines()[0]).toBe(`[${bar(0)}] 0%\n`)
    })

    it('should redraw in place, moving back over the two lines it wrote', () => {
      const progress = new Progress(10)

      progress.update(1, 'First')
      expect(moveCursor).not.toHaveBeenCalled()

      progress.update(2, 'Second')
      expect(moveCursor).toHaveBeenCalledWith(process.stdout, 0, -2)
      expect(moveCursor).toHaveBeenCalledTimes(1)
    })

    it('should clear both lines before rewriting them', () => {
      new Progress(10).update(1, 'First')

      expect(readline.cursorTo).toHaveBeenCalledTimes(2)
      expect(readline.clearLine).toHaveBeenCalledTimes(2)
    })
  })

  describe('spinner', () => {
    it('should not animate before a status has been set', () => {
      new Progress(10)

      vi.advanceTimersByTime(1500)

      expect(write).not.toHaveBeenCalled()
    })

    it('should cycle the globe frames while work is in progress', () => {
      const progress = new Progress(10)

      progress.update(1, 'Working')
      expect(lastRender()[1]).toBe('🌎 Working\n')

      vi.advanceTimersByTime(150)
      expect(lastRender()[1]).toBe('🌍 Working\n')

      vi.advanceTimersByTime(150)
      expect(lastRender()[1]).toBe('🌏 Working\n')

      vi.advanceTimersByTime(150)
      expect(lastRender()[1]).toBe('🌎 Working\n')
    })

    it('should hold the bar steady while only the frame advances', () => {
      const progress = new Progress(10)

      progress.update(3, 'Working')
      vi.advanceTimersByTime(150)

      expect(lastRender()[0]).toBe(`[${bar(9)}] 30%\n`)
    })

    it('should tick every 150ms without keeping the process alive', () => {
      const timer = { unref: vi.fn() }
      const setInterval = vi.spyOn(globalThis, 'setInterval').mockReturnValue(timer as never)

      new Progress(10)

      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 150)
      expect(timer.unref).toHaveBeenCalled()
    })
  })

  describe('stop()', () => {
    it('should render the final status', () => {
      const progress = new Progress(10)

      progress.update(10, 'Working')
      progress.stop('✅  Completed successfully.')

      expect(lastRender()).toEqual([`[${bar(30)}] 100%\n`, '🌎 ✅  Completed successfully.\n'])
    })

    it('should stop the animation', () => {
      const progress = new Progress(10)

      progress.update(1, 'Working')
      progress.stop('Done')

      const rendered = lines().length

      vi.advanceTimersByTime(1500)

      expect(lines()).toHaveLength(rendered)
      expect(vi.getTimerCount()).toBe(0)
    })

    it('should be safe to call twice', () => {
      const progress = new Progress(10)

      progress.stop('Done')

      expect(() => progress.stop('Done again')).not.toThrow()
      expect(lastRender()[1]).toBe('🌎 Done again\n')
    })
  })
})
