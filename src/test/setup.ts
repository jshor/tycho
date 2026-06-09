import '@testing-library/jest-dom';
import { vi } from 'vitest';

// OrbitControls needs a real DOM + WebGL context — mock it globally
class MockOrbitControls {
    camera: any;
    enabled = true;
    enableZoom = true;
    enablePan = true;
    autoRotate = false;
    autoRotateSpeed = 0;
    minDistance = 0;
    maxDistance = Infinity;

    constructor(camera: any, _domElement: any) {
        this.camera = camera;
    }
    update() {}
    dispose() {}
}

vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    OrbitControls: MockOrbitControls,
}));

// Lensflare JSM (THREE.LensFlare was removed in r124)
vi.mock('three/examples/jsm/objects/Lensflare.js', () => ({
    Lensflare: vi.fn().mockImplementation(function (this: any) {
        this.position = { set: vi.fn() };
        this.addElement = vi.fn();
    }),
    LensflareElement: vi.fn(),
}));

// @react-three/fiber — Canvas and hooks are no-ops in jsdom
vi.mock('@react-three/fiber', () => ({
    Canvas: ({ children }: any) => children,
    useThree: () => ({
        camera: { add: vi.fn(), position: { length: () => 1000 } },
        scene: { getObjectByName: vi.fn(), add: vi.fn(), background: null },
        gl: { domElement: document.createElement('canvas') },
    }),
    useFrame: vi.fn(),
}));

// @react-three/drei — stub out 3D helpers
vi.mock('@react-three/drei', () => ({
    Html: ({ children }: any) => children,
    PerspectiveCamera: () => null,
    Line: () => null,
}));
