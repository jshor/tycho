import React from 'react';
import { render } from '@testing-library/react';
import TextureContainer from '../TextureContainer';

// TextureContainer is now a functional component that uses useEffect + THREE.TextureLoader.

describe('Texture Container', () => {
    it('should render without textures', () => {
        expect(() => render(<TextureContainer />)).not.toThrow();
    });

    it('should render with a transparent flag', () => {
        expect(() => render(<TextureContainer transparent />)).not.toThrow();
    });

    it('should render with textures array', () => {
        const textures = [{ url: 'earth.jpg', slot: 'map' }];
        expect(() => render(<TextureContainer textures={textures} />)).not.toThrow();
    });

    it('should accept a custom side prop', () => {
        const { DoubleSide } = require('three');
        expect(() => render(<TextureContainer side={DoubleSide} />)).not.toThrow();
    });
});
