// Modules without bundled TypeScript definitions
declare module 'keymirror';
declare module 'react-animation-frame';
declare module 'react-datetime';
declare module 'react-slider';
declare module 'react-three-renderer';
declare module 'three-dom-label';
declare module 'three-orbit-controls';
declare module 'webgl-detect';
declare module 'deep-assign';
declare module 'web-audio-mock';

// CSS/SCSS imports
declare module '*.css';
declare module '*.scss';

// JSX elements provided by react-three-renderer
declare namespace JSX {
  interface IntrinsicElements {
    scene: any;
    perspectiveCamera: any;
    group: any;
    mesh: any;
    sphereGeometry: any;
    planeGeometry: any;
    meshLambertMaterial: any;
    texture: any;
    line: any;
    lineBasicMaterial: any;
    geometry: any;
    pointLight: any;
    ambientLight: any;
    directionalLight: any;
    spotLight: any;
    lensFlare: any;
    sprite: any;
  }
}

// Minimal three.js type declarations for TS 3.9 compatibility.
// @types/three 0.184+ uses TypeScript 5 syntax (using keyword) which TS 3.9 cannot parse.
declare module 'three' {
  export class Clock {
    constructor(autoStart?: boolean);
    autoStart: boolean;
    elapsedTime: number;
    start(): void;
    stop(): void;
    getElapsedTime(): number;
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    normalize(): this;
    multiplyScalar(scalar: number): this;
    length(): number;
    setFromMatrixPosition(m: Matrix4): this;
    [key: string]: any;
  }

  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    [key: string]: any;
  }

  export class Euler {
    constructor(x?: number, y?: number, z?: number, order?: string);
    x: number;
    y: number;
    z: number;
    [key: string]: any;
  }

  export class Matrix4 {
    [key: string]: any;
  }

  export class Quaternion {
    [key: string]: any;
  }

  export class Object3D {
    position: Vector3;
    matrix: Matrix4;
    matrixWorld: Matrix4;
    parent: Object3D | null;
    children: Object3D[];
    matrixAutoUpdate: boolean;
    matrixWorldNeedsUpdate: boolean;
    add(object: Object3D): this;
    updateMatrix(): void;
    updateMatrixWorld(force?: boolean): void;
    getObjectByName(name: string): Object3D | undefined;
    [key: string]: any;
  }

  export class Camera extends Object3D {
    [key: string]: any;
  }

  export class Scene extends Object3D {
    background: any;
    [key: string]: any;
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    [key: string]: any;
  }

  export class Geometry {
    vertices: Vector3[];
    [key: string]: any;
  }

  export class CubeTexture {
    [key: string]: any;
  }

  export class Color {
    constructor(color?: number | string);
    [key: string]: any;
  }

  export class Texture {
    [key: string]: any;
  }

  export class TextureLoader {
    load(
      url: string,
      onLoad?: (texture: Texture) => void,
      onProgress?: () => void,
      onError?: () => void
    ): Texture;
  }

  export class CubeTextureLoader {
    load(urls: string[]): any;
  }

  export class EllipseCurve {
    constructor(
      aX: number, aY: number,
      xRadius: number, yRadius: number,
      aStartAngle: number, aEndAngle: number,
      aClockwise?: boolean, aRotation?: number
    );
    getPoints(divisions?: number): Vector3[];
    [key: string]: any;
  }

  export class CurvePath {
    add(curve: any): void;
    getPoint(t: number): Vector3;
    createPointsGeometry(divisions: number): any;
    [key: string]: any;
  }

  export class Path {
    constructor(points?: any[]);
    add(curve: any): void;
    createPointsGeometry(divisions: number): any;
    [key: string]: any;
  }

  export class AudioListener extends Object3D {
    [key: string]: any;
  }

  export class AudioLoader {
    load(url: string, onLoad: (buffer: AudioBuffer) => void): void;
  }

  export class Audio {
    constructor(listener: AudioListener);
    setBuffer(buffer: AudioBuffer): this;
    setLoop(loop: boolean): this;
    setVolume(volume: number): this;
    play(): this;
    pause(): this;
    [key: string]: any;
  }

  export const AdditiveBlending: number;
  export const DoubleSide: number;
  export const FrontSide: number;

  export const DefaultLoadingManager: {
    onProgress: ((url: string, loaded: number, total: number) => void) | null;
    [key: string]: any;
  };
}
