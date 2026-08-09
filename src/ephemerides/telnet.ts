import { Socket } from 'node:net'
import { URL } from 'node:url'

const TIMEOUT = 5000

export type TelnetEntry = {
  output: RegExp
  input: string
  isComplete?: boolean
}

/**
 * Starts a new interactive telnet session with the given host.
 */
export async function telnet(host: URL, entries: TelnetEntry[]) {
  const socket = new Socket()

  let isInteracting = false
  let chunks = ''

  return new Promise<string>((resolve, reject) => {
    /**
     * Applies a timeout to the session.
     */
    socket.setTimeout(TIMEOUT)
    socket.once('timeout', () => {
      closeSocket(socket)
      reject(`Timed out while attempting to connect to ${host.hostname}:${host.port}.`)
    })

    /**
     * Handles errors in the session.
     */
    socket.once('error', (error) => {
      if (isInteracting) {
        isInteracting = false
      }

      closeSocket(socket)
      reject(error)
    })

    /**
     * Connects to the socket.
     */
    socket.once('connect', socket.setNoDelay.bind(socket))
    socket.connect(parseInt(host.port), host.hostname)

    /**
     * Handles the termination of the open session.
     */
    socket.on('end', () => {
      if (isInteracting) {
        process.stdin.removeAllListeners('data')
        process.exit(0)
      }
    })

    /**
     * Processes the data received from the socket.
     *
     * The data is processed in sequence, and the next step is only executed when the previous one has completed.
     */
    socket.on('data', (data) => {
      if (isInteracting) {
        return process.stdout.write(data)
      }

      const currentIndex = entries.findIndex((entry) => !entry.isComplete)

      if (!entries[currentIndex] || entries[currentIndex].isComplete) {
        closeSocket(socket)
        return resolve(getChunkData(chunks))
      }

      chunks += data

      if (entries[currentIndex].output.test(chunks)) {
        entries[currentIndex].isComplete = true

        if (currentIndex === entries.length - 1) {
          resolve(getChunkData(chunks))
        }

        socket.write(entries[currentIndex].input)
        chunks = ''
      }
    })
  })
}

/**
 * Returns a single stream of lines from the given chunks of data,
 * excluding the first and last lines if there are more than 3 lines.
 */
function getChunkData(chunks: string) {
  const lines = chunks.split(/\r?\n/).reduce((lines, line) => {
    return line ? [...lines, line] : lines
  }, [])

  return lines.length >= 3 ? lines.slice(1, lines.length - 1).join('\n') : lines.join('\n')
}

/**
 * Closes the given socket.
 */
function closeSocket(socket: Socket) {
  socket.removeAllListeners('data').removeAllListeners('error')
  socket.destroy()
}
