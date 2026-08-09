import readline from 'node:readline'

/**
 * A terminal progress indicator.
 */
export class Progress {
  /** Whether or not a frame has been drawn. */
  private hasRendered = false

  /** Number of items that have been completed (out of `total`). */
  private current = 0

  /** The message shown beside the globe. Empty until the first `update()`. */
  private status = ''

  /** Index into `frames` of the globe currently being shown. */
  private frame = 0

  /** The animation timer, cleared by `stop()`. */
  private timer?: NodeJS.Timeout

  /** The globe faces cycled through to animate the spinner. */
  private readonly frames = ['🌎', '🌍', '🌏']

  /**
   * Starts the spinner.
   */
  constructor(protected total: number) {
    this.timer = setInterval(() => {
      if (!this.status) return

      this.frame = (this.frame + 1) % this.frames.length
      this.render()
    }, 150)
    this.timer.unref()
  }

  /**
   * Advances the bar and replaces the status line.
   */
  update(current: number, status: string) {
    this.current = current
    this.status = status
    this.render()
  }

  /**
   * Halts the animation with the given status as the final line.
   */
  stop(status: string) {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = undefined
    }

    this.current = this.total
    this.status = status
    this.render()
  }

  /**
   * Draws the bar and status lines.
   */
  private render() {
    const width = 30
    const ratio = this.total > 0 ? Math.min(this.current / this.total, 1) : 0

    const filled = Math.round(ratio * width)
    const percent = Math.round(ratio * 100)
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
    const hourglass = this.frames[this.frame]

    if (this.hasRendered) {
      readline.moveCursor(process.stdout, 0, -2)
    }

    readline.cursorTo(process.stdout, 0)
    readline.clearLine(process.stdout, 0)
    process.stdout.write(`[${bar}] ${percent}%\n`)

    readline.cursorTo(process.stdout, 0)
    readline.clearLine(process.stdout, 0)
    process.stdout.write(`${hourglass} ${this.status}\n`)

    this.hasRendered = true
  }
}
