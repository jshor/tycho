import React from 'react';
import { render } from '@testing-library/react';
import { ModalContainer } from '../ModalContainer';

const action = { toggleModal: vi.fn(), setUIControls: vi.fn() };

describe('Modal Container', () => {
    let ref: React.RefObject<ModalContainer>;

    beforeEach(() => {
        vi.clearAllMocks();
        ref = React.createRef<ModalContainer>();
        render(<ModalContainer action={action} type="TEST_MODAL" ref={ref as any} />);
    });

    afterEach(() => {
        window.removeEventListener('keydown', (ref.current as any)?.onKeyPressed);
    });

    describe('componentDidMount()', () => {
        it('should register a keydown listener on window', () => {
            const spy = vi.spyOn(window, 'addEventListener');
            ref.current!.componentDidMount!();
            expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('componentWillUnmount()', () => {
        it('should remove the keydown listener', () => {
            const spy = vi.spyOn(window, 'removeEventListener');
            ref.current!.componentWillUnmount!();
            expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('isModalActive()', () => {
        it('should return true when activeModal matches type', () => {
            (ref.current! as any).props = { activeModal: 'TEST_MODAL', type: 'TEST_MODAL' };
            expect(ref.current!.isModalActive()).toBe(true);
        });

        it('should return false when types differ', () => {
            (ref.current! as any).props = { activeModal: 'OTHER_MODAL', type: 'TEST_MODAL' };
            expect(ref.current!.isModalActive()).toBe(false);
        });
    });

    describe('closeModal()', () => {
        it('should toggle the modal closed and re-enable UI controls', () => {
            (ref.current! as any).props = { action };
            ref.current!.closeModal();

            expect(action.toggleModal).toHaveBeenCalledWith(null);
            expect(action.setUIControls).toHaveBeenCalledWith(true);
        });
    });

    describe('onKeyPressed()', () => {
        it('should close the modal when Escape is pressed and modal is active', () => {
            const container = ref.current!;
            (container as any).props = { action, activeModal: 'TEST_MODAL', type: 'TEST_MODAL' };
            const spy = vi.spyOn(container, 'closeModal');

            container.onKeyPressed({ keyCode: 27 } as any);

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should not close the modal when Escape is pressed but modal is inactive', () => {
            const container = ref.current!;
            (container as any).props = { action, activeModal: null, type: 'TEST_MODAL' };
            const spy = vi.spyOn(container, 'closeModal');

            container.onKeyPressed({ keyCode: 27 } as any);

            expect(spy).not.toHaveBeenCalled();
        });
    });
});
