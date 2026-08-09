import type { EventEmitter } from 'node:events'
import { telnet, type TelnetEntry } from '../telnet'

/** The surface of `net.Socket` that the telnet client actually touches. */
type FakeSocket = EventEmitter & {
  setTimeout: ReturnType<typeof vi.fn>
  setNoDelay: ReturnType<typeof vi.fn>
  connect: ReturnType<typeof vi.fn>
  write: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
}

const { sockets } = vi.hoisted(() => ({ sockets: [] as FakeSocket[] }))

vi.mock('node:net', async () => {
  const { EventEmitter } = await import('node:events')

  class FakeSocket extends EventEmitter {
    setTimeout = vi.fn()
    setNoDelay = vi.fn()
    connect = vi.fn()
    write = vi.fn()
    destroy = vi.fn()

    constructor() {
      super()
      sockets.push(this as unknown as FakeSocket)
    }
  }

  return { Socket: FakeSocket, default: { Socket: FakeSocket } }
})

const HOST = new URL('telnet://horizons.jpl.nasa.gov:6775')

const currentSocket = () => sockets[sockets.length - 1]

describe('Telnet Client', () => {
  beforeEach(() => {
    sockets.length = 0
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('connection', () => {
    it('should connect to the given host and port', () => {
      void telnet(HOST, [{ output: /never/, input: 'x' }])

      expect(currentSocket().connect).toHaveBeenCalledWith(6775, 'horizons.jpl.nasa.gov')
    })

    it('should apply a timeout to the session', () => {
      void telnet(HOST, [{ output: /never/, input: 'x' }])

      expect(currentSocket().setTimeout).toHaveBeenCalledWith(5000)
    })

    it('should disable Nagle buffering once connected', () => {
      void telnet(HOST, [{ output: /never/, input: 'x' }])

      const socket = currentSocket()
      expect(socket.setNoDelay).not.toHaveBeenCalled()

      socket.emit('connect')

      expect(socket.setNoDelay).toHaveBeenCalled()
    })
  })

  describe('interactive sequence', () => {
    let entries: TelnetEntry[]
    let session: Promise<string>

    beforeEach(() => {
      entries = [
        { output: /Horizons> /, input: 'first\r\n' },
        { output: /Computations by/, input: 'second\r\n' }
      ]
      session = telnet(HOST, entries)
    })

    it("should write the entry's input once its output pattern is seen", () => {
      currentSocket().emit('data', Buffer.from('Horizons> '))

      expect(currentSocket().write).toHaveBeenCalledWith('first\r\n')
    })

    it('should not advance until the pattern matches', () => {
      currentSocket().emit('data', Buffer.from('still connecting'))

      expect(currentSocket().write).not.toHaveBeenCalled()
      expect(entries[0].isComplete).toBeUndefined()
    })

    it('should accumulate chunks until the pattern matches across them', () => {
      const socket = currentSocket()

      socket.emit('data', Buffer.from('Horiz'))
      expect(socket.write).not.toHaveBeenCalled()

      socket.emit('data', Buffer.from('ons> '))
      expect(socket.write).toHaveBeenCalledWith('first\r\n')
    })

    it('should work through the entries in order', async () => {
      const socket = currentSocket()

      socket.emit('data', Buffer.from('Horizons> '))
      socket.emit('data', Buffer.from('header\nEC= 1\nComputations by\n'))

      await expect(session).resolves.toBeTypeOf('string')
      expect(socket.write.mock.calls).toEqual([['first\r\n'], ['second\r\n']])
      expect(entries.every(({ isComplete }) => isComplete)).toBe(true)
    })

    it('should resolve with the payload once the last entry completes', async () => {
      const socket = currentSocket()

      socket.emit('data', Buffer.from('Horizons> '))
      socket.emit('data', Buffer.from('header\nEC= 1\nQR= 2\nComputations by\n'))

      await expect(session).resolves.toBe('EC= 1\nQR= 2')
    })

    it('should keep every line when there are fewer than three', async () => {
      const socket = currentSocket()

      socket.emit('data', Buffer.from('Horizons> '))
      socket.emit('data', Buffer.from('EC= 1\nComputations by\n'))

      await expect(session).resolves.toBe('EC= 1\nComputations by')
    })

    it('should only carry the chunks received since the previous entry', async () => {
      const socket = currentSocket()

      socket.emit('data', Buffer.from('banner text\nHorizons> '))
      socket.emit('data', Buffer.from('a\nb\nc\nComputations by\n'))

      await expect(session).resolves.not.toContain('banner text')
    })
  })

  describe('completed sessions', () => {
    it('should resolve and tear down when there is nothing left to send', async () => {
      const entries: TelnetEntry[] = [
        { output: /Horizons> /, input: 'first\r\n', isComplete: true }
      ]
      const session = telnet(HOST, entries)
      const socket = currentSocket()

      socket.emit('data', Buffer.from('trailing output'))

      await expect(session).resolves.toBe('')
      expect(socket.destroy).toHaveBeenCalled()
      expect(socket.write).not.toHaveBeenCalled()
    })
  })

  describe('failures', () => {
    it('should reject on timeout, naming the host', async () => {
      const session = telnet(HOST, [{ output: /never/, input: 'x' }])

      currentSocket().emit('timeout')

      await expect(session).rejects.toBe(
        'Timed out while attempting to connect to horizons.jpl.nasa.gov:6775.'
      )
    })

    it('should destroy the socket on timeout', async () => {
      const session = telnet(HOST, [{ output: /never/, input: 'x' }])
      const socket = currentSocket()

      socket.emit('timeout')
      await expect(session).rejects.toBeTruthy()

      expect(socket.destroy).toHaveBeenCalled()
    })

    it('should reject with the socket error', async () => {
      const error = new Error('ECONNREFUSED')
      const session = telnet(HOST, [{ output: /never/, input: 'x' }])
      const socket = currentSocket()

      socket.emit('error', error)

      await expect(session).rejects.toBe(error)
      expect(socket.destroy).toHaveBeenCalled()
    })

    it('should stop listening for data once the session has failed', async () => {
      const session = telnet(HOST, [{ output: /Horizons> /, input: 'first\r\n' }])
      const socket = currentSocket()

      socket.emit('error', new Error('ECONNREFUSED'))
      await expect(session).rejects.toBeTruthy()

      socket.emit('data', Buffer.from('Horizons> '))

      expect(socket.write).not.toHaveBeenCalled()
    })
  })
})
