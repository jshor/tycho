import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { renderInScene } from '../../../test/helpers'
import userEvent from '@testing-library/user-event'
import * as THREE from 'three'
import { CameraText } from './cameraText'
import { Constants } from '../../../constants'

/**
 * The frame loop and the camera it runs against, which the component is otherwise given no way to
 * reach in a test: r3f's own `useFrame` is stubbed out for the whole suite, so the callback is
 * caught here and driven a frame at a time.
 */
const scene = vi.hoisted(() => ({
  frame: undefined as undefined | (() => void),
  three: {
    camera: undefined as unknown,
    size: { width: 800, height: 600 }
  },
  /** Whether the text reports laid-out bounds yet, which the backing plane is fitted to. */
  hasBounds: true
}))

vi.mock('@react-three/fiber', () => ({
  useThree: () => scene.three,
  useFrame: (callback: () => void) => {
    scene.frame = callback
  }
}))

vi.mock('@react-three/drei', async () => {
  const React = (await import('react')).default

  // stands in for the troika text, which reports the bounds of the block it laid out
  const Text = React.forwardRef<unknown, { children?: React.ReactNode }>(({ children }, ref) => {
    React.useImperativeHandle(ref, () => ({
      textRenderInfo: scene.hasBounds ? { blockBounds: [-2, -0.5, 2, 0.5] } : undefined
    }))

    return React.createElement('span', null, children)
  })

  Text.displayName = 'Text'

  return { Text }
})

describe('Camera Text Component', () => {
  const handlers = {
    onClick: vi.fn(),
    onPointerOver: vi.fn(),
    onPointerOut: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    scene.frame = undefined
    scene.hasBounds = true
    scene.three.camera = new THREE.PerspectiveCamera(
      Constants.WebGL.Camera.FOV,
      4 / 3,
      0.001,
      18000
    )
  })

  it('should render the text it is given', () => {
    renderInScene(<CameraText>Earth</CameraText>)

    expect(screen.getByText('Earth')).toBeInTheDocument()
  })

  it('should back the text with a plane, to keep it legible over whatever lies behind it', () => {
    const { container } = renderInScene(<CameraText>Earth</CameraText>)

    expect(container.querySelector('mesh planeGeometry')).not.toBeNull()
  })

  it('should report a plain click', async () => {
    const user = userEvent.setup()
    renderInScene(<CameraText {...handlers}>Earth</CameraText>)

    await user.click(screen.getByText('Earth'))

    expect(handlers.onClick).toHaveBeenCalled()
  })

  describe('tapping', () => {
    /**
     * Presses and releases the text, with the pointer drifting the given distance between.
     *
     * jsdom has no PointerEvent, and the plain Event that testing-library falls back to carries
     * no coordinates at all, so these are dispatched as mouse events instead.
     */
    const tap = (drift: number) => {
      const label = screen.getByText('Earth')
      const press = { bubbles: true, clientX: 100, clientY: 100 }

      fireEvent(label, new MouseEvent('pointerdown', press))
      fireEvent(label, new MouseEvent('pointerup', { ...press, clientX: 100 + drift }))
    }

    it('should report a finger that lands and lifts in the same place', () => {
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      tap(0)

      expect(handlers.onClick).toHaveBeenCalled()
    })

    it('should forgive a finger that drifts as it lifts', () => {
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      tap(Constants.UI.FAT_FINGER - 1)

      expect(handlers.onClick).toHaveBeenCalled()
    })

    it('should say nothing when the scene was dragged instead', () => {
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      tap(Constants.UI.FAT_FINGER + 1)

      expect(handlers.onClick).not.toHaveBeenCalled()
    })

    it('should say nothing when a release arrives without a press', () => {
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      fireEvent(
        screen.getByText('Earth'),
        new MouseEvent('pointerup', { bubbles: true, clientX: 100, clientY: 100 })
      )

      expect(handlers.onClick).not.toHaveBeenCalled()
    })

    it('should hold on to the finger that pressed it, so a drag off it still reports back', () => {
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      const label = screen.getByText('Earth')
      const capture = vi.fn()
      const release = vi.fn()

      // jsdom captures no pointers of its own
      Object.assign(label, { setPointerCapture: capture, releasePointerCapture: release })

      const press = { bubbles: true, clientX: 100, clientY: 100 }

      fireEvent(label, new MouseEvent('pointerdown', press))
      fireEvent(label, new MouseEvent('pointerup', press))

      expect(capture).toHaveBeenCalled()
      expect(release).toHaveBeenCalled()
    })
  })

  describe('hovering', () => {
    it('should report a pointer arriving', async () => {
      const user = userEvent.setup()
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      await user.hover(screen.getByText('Earth'))

      expect(handlers.onPointerOver).toHaveBeenCalled()
    })

    it('should report a pointer leaving only once it has stayed away', async () => {
      const user = userEvent.setup()
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      await user.hover(screen.getByText('Earth'))
      await user.unhover(screen.getByText('Earth'))

      // it holds on for a moment first, in case the pointer is coming back
      expect(handlers.onPointerOut).not.toHaveBeenCalled()

      await waitFor(() => expect(handlers.onPointerOut).toHaveBeenCalled())
    })

    it('should say nothing when the pointer flickers off and straight back on', async () => {
      const user = userEvent.setup()
      renderInScene(<CameraText {...handlers}>Earth</CameraText>)
      const label = screen.getByText('Earth')

      await user.hover(label)
      await user.unhover(label)
      await user.hover(label)

      // long enough that a departure would have been seen through had it not been called off
      await new Promise((resolve) => setTimeout(resolve, Constants.UI.HOVER_LINGER * 2))

      expect(handlers.onPointerOut).not.toHaveBeenCalled()
    })

    it('should drop a departure still pending when the label goes away', async () => {
      const user = userEvent.setup()
      const { unmount } = renderInScene(<CameraText {...handlers}>Earth</CameraText>)

      await user.hover(screen.getByText('Earth'))
      await user.unhover(screen.getByText('Earth'))

      unmount()

      await new Promise((resolve) => setTimeout(resolve, Constants.UI.HOVER_LINGER * 2))

      expect(handlers.onPointerOut).not.toHaveBeenCalled()
    })
  })

  describe('on each frame', () => {
    const camera = () => scene.three.camera as THREE.PerspectiveCamera

    /** Runs one frame, from inside React's update cycle: the loop can drop the highlight. */
    const advanceFrame = () => act(() => scene.frame?.())

    /**
     * jsdom renders r3f's primitives as plain elements, so the pieces of a THREE.Object3D that the
     * frame loop reads off them and writes back are grafted on here.
     */
    const asObject3D = (element: Element | null) =>
      Object.assign(element as object, {
        visible: true,
        position: new THREE.Vector3(),
        scale: new THREE.Vector3(1, 1, 1),
        quaternion: new THREE.Quaternion(),
        renderOrder: 0
      }) as unknown as THREE.Group

    /**
     * Renders the text hanging off a body, and runs a frame against it.
     *
     * Returns the stand-in for the label's own group, whose placement is what the frame loop
     * settles, and the body it is hung from.
     */
    const runFrame = ({
      standoff = 0,
      barycenterId,
      maxDistance,
      bodyAt = new THREE.Vector3(),
      cameraAt = new THREE.Vector3(0, 0, 10),
      barycenterName
    }: {
      standoff?: number
      barycenterId?: string
      maxDistance?: number
      bodyAt?: THREE.Vector3
      cameraAt?: THREE.Vector3
      barycenterName?: string
    } = {}) => {
      const { container } = renderInScene(
        <CameraText standoff={standoff} barycenterId={barycenterId} maxDistance={maxDistance}>
          Earth
        </CameraText>
      )

      const system = new THREE.Group()
      const body = new THREE.Group()

      system.name = barycenterName ?? 'system'
      system.add(body)
      body.position.copy(bodyAt)
      system.updateMatrixWorld(true)

      const group = asObject3D(container.querySelector('group'))
      const background = asObject3D(container.querySelector('mesh'))

      group.parent = body

      camera().position.copy(cameraAt)
      camera().updateMatrixWorld(true)

      advanceFrame()

      return { group, background, body }
    }

    it('should leave everything alone until the label is hung off a body', () => {
      const { container } = renderInScene(<CameraText standoff={1}>Earth</CameraText>)
      const group = asObject3D(container.querySelector('group'))

      // no parent yet, so there is nothing to place the label against
      expect(advanceFrame).not.toThrow()
      expect(group.position.length()).toEqual(0)
    })

    it('should sit the label on the body when it is given no standoff', () => {
      const { group } = runFrame({ standoff: 0 })

      expect(group.position.length()).toEqual(0)
    })

    it('should stand the label off toward the camera by the distance it is given', () => {
      const { group } = runFrame({ standoff: 0.5, cameraAt: new THREE.Vector3(0, 0, 10) })

      // the camera is straight down +z, so that is the way the label steps off the body
      expect(group.position.z).toBeCloseTo(0.5)
      expect(group.position.x).toBeCloseTo(0)
      expect(group.position.y).toBeCloseTo(0)
    })

    it('should stand the label off further when the body is too far for the standoff to tell', () => {
      const far = 1000
      const { group } = runFrame({ standoff: 0.5, cameraAt: new THREE.Vector3(0, 0, far) })

      // the depth buffer cannot separate half a unit at this range, so a share of the distance is
      // used instead of the standoff it was given
      expect(group.position.z).toBeCloseTo(far * Constants.WebGL.LABEL_DEPTH_BIAS)
      expect(group.position.z).toBeGreaterThan(0.5)
    })

    it('should leave the label on the body when the camera sits on top of it', () => {
      const { group } = runFrame({ standoff: 0.5, cameraAt: new THREE.Vector3() })

      // there is no direction to step off along
      expect(group.position.length()).toEqual(0)
    })

    it('should turn the label square to the camera', () => {
      const { group } = runFrame({ cameraAt: new THREE.Vector3(8, 3, 6) })

      const facing = new THREE.Quaternion()

      camera().getWorldQuaternion(facing)

      expect(group.quaternion.angleTo(facing)).toBeCloseTo(0)
    })

    it('should draw nearer labels over ones further off', () => {
      const near = runFrame({ cameraAt: new THREE.Vector3(0, 0, 5) }).group.renderOrder

      const far = runFrame({ cameraAt: new THREE.Vector3(0, 0, 500) }).group.renderOrder

      expect(near).toBeGreaterThan(far)
    })

    it('should hold the label at the same size on screen however far off it is', () => {
      const near = runFrame({ cameraAt: new THREE.Vector3(0, 0, 5) }).group
      const nearSize = near.scale.x / 5

      const far = runFrame({ cameraAt: new THREE.Vector3(0, 0, 50) }).group
      const farSize = far.scale.x / 50

      // the label grows in step with its distance, which is what leaves it the same size to look at
      expect(farSize).toBeCloseTo(nearSize)
    })

    it('should fit the backing plane around the text laid out on it', () => {
      const { background } = runFrame()
      const padding = Constants.WebGL.LABEL_BACKGROUND_PADDING

      // the stand-in text lays out a block from (-2, -0.5) to (2, 0.5)
      expect(background.scale.x).toBeCloseTo(4 + padding * 2)
      expect(background.scale.y).toBeCloseTo(1 + padding * 2)
      expect(background.position.x).toBeCloseTo(0)
    })

    it('should leave the backing plane alone until the text reports its bounds', () => {
      scene.hasBounds = false

      const { background } = runFrame()

      expect(background.scale.x).toEqual(1)
    })

    describe('when it is measured from a barycenter', () => {
      it('should show a label whose barycenter is within range', () => {
        const { group } = runFrame({
          barycenterId: 'system',
          barycenterName: 'system',
          maxDistance: 100,
          cameraAt: new THREE.Vector3(0, 0, 10)
        })

        expect(group.visible).toBe(true)
      })

      it('should hide a label whose barycenter has fallen out of range', () => {
        const { group } = runFrame({
          barycenterId: 'system',
          barycenterName: 'system',
          maxDistance: 1,
          cameraAt: new THREE.Vector3(0, 0, 500)
        })

        expect(group.visible).toBe(false)
      })

      it('should place a label whose barycenter it cannot find', () => {
        const { group } = runFrame({
          barycenterId: 'nowhere',
          barycenterName: 'system',
          maxDistance: 1,
          standoff: 0.5,
          cameraAt: new THREE.Vector3(0, 0, 10)
        })

        // nothing to measure against, so it is left on screen
        expect(group.visible).toBe(true)
        expect(group.position.z).toBeCloseTo(0.5)
      })

      it('should place a label given a barycenter but no range to hold it to', () => {
        const { group } = runFrame({
          barycenterId: 'system',
          barycenterName: 'system',
          maxDistance: Infinity,
          standoff: 0.5
        })

        expect(group.position.z).toBeCloseTo(0.5)
      })

      describe('once it has fallen out of range', () => {
        /** Renders the text, hangs it off a body, then pulls the camera away out of range. */
        const cull = () => {
          const result = renderInScene(
            <CameraText {...handlers} barycenterId="system" maxDistance={1}>
              Earth
            </CameraText>
          )

          const system = new THREE.Group()
          const body = new THREE.Group()

          system.name = 'system'
          system.add(body)
          system.updateMatrixWorld(true)

          asObject3D(result.container.querySelector('group')).parent = body
          camera().position.set(0, 0, 500)
          camera().updateMatrixWorld(true)

          return result
        }

        it('should ignore a finger landing on where it used to be', () => {
          cull()
          advanceFrame()

          const label = screen.getByText('Earth')
          const press = { bubbles: true, clientX: 100, clientY: 100 }

          fireEvent(label, new MouseEvent('pointerdown', press))
          fireEvent(label, new MouseEvent('pointerup', press))

          expect(handlers.onClick).not.toHaveBeenCalled()
        })

        it('should ignore a pointer coming to rest over where it used to be', async () => {
          const user = userEvent.setup()

          cull()
          advanceFrame()

          await user.hover(screen.getByText('Earth'))

          expect(handlers.onPointerOver).not.toHaveBeenCalled()
        })

        it('should abandon a press it was in the middle of when it went out of range', () => {
          cull()

          const label = screen.getByText('Earth')
          const press = { bubbles: true, clientX: 100, clientY: 100 }

          // pressed while still on screen, culled before the finger came off again
          fireEvent(label, new MouseEvent('pointerdown', press))
          advanceFrame()
          fireEvent(label, new MouseEvent('pointerup', press))

          expect(handlers.onClick).not.toHaveBeenCalled()
        })
      })

      it('should let go of the highlight when it falls out of range while hovered', async () => {
        const user = userEvent.setup()
        const { container } = renderInScene(
          <CameraText {...handlers} barycenterId="system" maxDistance={1}>
            Earth
          </CameraText>
        )

        await user.hover(screen.getByText('Earth'))

        const system = new THREE.Group()
        const body = new THREE.Group()

        system.name = 'system'
        system.add(body)
        system.updateMatrixWorld(true)

        const group = asObject3D(container.querySelector('group'))

        group.parent = body
        camera().position.set(0, 0, 500)
        camera().updateMatrixWorld(true)

        advanceFrame()

        expect(group.visible).toBe(false)
      })
    })
  })
})
