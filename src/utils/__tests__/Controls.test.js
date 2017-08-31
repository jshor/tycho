import {Camera, Vector3} from 'three';
import Controls from '../Controls';

describe('Controls', () => {
  let camera, controls;

  beforeEach(() => {
    camera = new Camera();
    controls = new Controls(camera);
  });
  
  describe('zoom()', () => {
    describe('when the zoom level has changed', () => {
      const newLevel = 0.5;
      let spy;

      beforeEach(() => {
        spy = jest.spyOn(controls, 'pan');
        controls.level = 0.6;
        
        controls.zoom(50);
      });

      it('should update the `level` property to the new zoom and pan', () => {
        expect(typeof controls.level).toBe('number');
        expect(controls.level).toEqual(newLevel);
      });

      it('should pan to the new level', () => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(newLevel);
      });
    });

    describe('when the zoom level has not changed', () => {
      it('should not change the `level` property', () => {
        const oldLevel = 0.5;
        controls.level = oldLevel;

        controls.zoom(50);

        expect(typeof controls.level).toBe('number');
        expect(controls.level).toEqual(oldLevel);
      });
    });
  });

  describe('pan()', () => {
    it('should set the camera position vector to the new zoom vector', () => {
      const zoomVector = new Vector3(1, 2, 3);

      controls.getZoomVector = () => zoomVector;
      controls.pan(0.5);

      expect(controls.camera.position).toBeInstanceOf(Vector3);
      expect(controls.camera.position).toEqual(zoomVector);
    });
  });

  describe('getZoomVector()', () => {
    it('should scale the given vector by the given scalar', () => {
      const vector = new Vector3(1, 2, 3);
      const scalar = 10;
      
      controls.maxDistance = 4;

      const result = controls.getZoomVector(vector, scalar);

      expect(result).toBeInstanceOf(Vector3);
      expect(result.x).toEqual(10.690449676496975);
      expect(result.y).toEqual(21.38089935299395);
      expect(result.z).toEqual(32.071349029490925);
    });
  });

  describe('getDistance()', () => {
    it('should return maxDistance minus minDistance', () => {
      controls.maxDistance = 10;
      controls.minDistance = 3;

      const result = controls.getDistance();

      expect(typeof result).toEqual('number');
      expect(result).toEqual(7);
    });
  });

  describe('enable()', () => {
    it('should set the controls to be enabled', () => {
      controls.enable();

      expect(typeof controls.enabled).toBe('boolean');
      expect(controls.enabled).toEqual(true);
    });
  });

  describe('disable()', () => {
    it('should set the controls to be disabled', () => {
      controls.disable();

      expect(typeof controls.enabled).toBe('boolean');
      expect(controls.enabled).toEqual(false);
    });
  });
});
