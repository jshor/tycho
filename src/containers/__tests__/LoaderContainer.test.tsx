import React from 'react';
import { render } from '@testing-library/react';
import { DefaultLoadingManager } from 'three';
import { LoaderContainer } from '../LoaderContainer';

const action = {
    setPercentLoaded: vi.fn(),
    setTextureLoaded: vi.fn(),
    setPlaying: vi.fn(),
    setVolume: vi.fn(),
};

describe('Loader Container', () => {
    let ref: React.RefObject<LoaderContainer>;

    beforeEach(() => {
        vi.clearAllMocks();
        ref = React.createRef<LoaderContainer>();
        render(<LoaderContainer action={action} ref={ref as any} />);
    });

    describe('componentDidMount()', () => {
        it('should register a progress handler on DefaultLoadingManager', () => {
            expect((DefaultLoadingManager as any).onProgress).toBe(ref.current!.onProgress);
        });
    });

    describe('onProgress()', () => {
        it('should dispatch setPercentLoaded and setTextureLoaded', () => {
            (ref.current! as any).props = { action };
            ref.current!.onProgress('tex.png', 2, 4);

            expect(action.setPercentLoaded).toHaveBeenCalledWith(2, 4);
            expect(action.setTextureLoaded).toHaveBeenCalledWith('tex.png');
        });
    });

    describe('enterScene()', () => {
        it('should start playing and set volume to 1', () => {
            (ref.current! as any).props = { action };
            ref.current!.enterScene();

            expect(action.setPlaying).toHaveBeenCalledWith(true);
            expect(action.setVolume).toHaveBeenCalledWith(1);
        });

        it('should set hasEntered state to true', () => {
            (ref.current! as any).props = { action };
            ref.current!.enterScene();

            expect(ref.current!.state.hasEntered).toBe(true);
        });
    });
});
