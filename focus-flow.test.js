import FocusFlowClass from './focus-flow.js'; // Assuming default export is the instance
// To test methods directly on the class, you'd ideally export the class itself:
// import { FocusFlow } from './focus-flow.js'; // if you change export in focus-flow.js

// Since focus-flow.js exports `new FocusFlow()`, we get an instance.
// To test prototype methods without relying on the instance's state or DOM interactions from create():
const focusFlowInstance = Object.getPrototypeOf(FocusFlowClass);

describe('FocusFlow', () => {
  describe('getPosition', () => {
    it('should return position and dimensions of a target element', () => {
      const mockTarget = {
        getBoundingClientRect: jest.fn(() => ({
          top: 10,
          left: 20,
          width: 100,
          height: 50,
        })),
      };
      const position = focusFlowInstance.getPosition(mockTarget);
      expect(mockTarget.getBoundingClientRect).toHaveBeenCalled();
      expect(position).toEqual({
        top: 10,
        left: 20,
        width: 100,
        height: 50,
      });
    });
  });

  describe('convertToRem', () => {
    let originalGetComputedStyle;

    beforeEach(() => {
      originalGetComputedStyle = global.getComputedStyle;
      // Mock getComputedStyle to control the root font size
      global.getComputedStyle = jest.fn(element => {
        if (element === document.documentElement) {
          // This can be changed per test if needed
          return { fontSize: '16px' };
        }
        return originalGetComputedStyle(element); // Fallback for other elements
      });
    });

    afterEach(() => {
      global.getComputedStyle = originalGetComputedStyle;
    });

    it('should convert pixel value to rem based on root font size (16px)', () => {
      const remValue = focusFlowInstance.convertToRem(32);
      expect(global.getComputedStyle).toHaveBeenCalledWith(document.documentElement);
      expect(remValue).toBe('2rem');
    });

    it('should handle different font sizes (e.g., 10px)', () => {
      // Adjust the mock for this specific test case
      global.getComputedStyle = jest.fn(element => {
        if (element === document.documentElement) {
          return { fontSize: '10px' };
        }
        return originalGetComputedStyle(element);
      });
      const remValue = focusFlowInstance.convertToRem(30);
      expect(global.getComputedStyle).toHaveBeenCalledWith(document.documentElement);
      expect(remValue).toBe('3rem');
    });
  });

  describe('enforceArray', () => {
    it('should return an array if value is not an array', () => {
      expect(focusFlowInstance.enforceArray('test')).toEqual(['test']);
    });

    it('should return the same array if value is already an array', () => {
      expect(focusFlowInstance.enforceArray(['test1', 'test2'])).toEqual(['test1', 'test2']);
    });

    it('should return an array with unique values if input array has duplicates', () => {
      expect(focusFlowInstance.enforceArray(['test1', 'test1', 'test2'])).toEqual(['test1', 'test2']);
    });
  });

  describe('isRadio', () => {
    it('should return true for a radio input element', () => {
      const mockNode = { tagName: 'INPUT', type: 'radio' };
      expect(focusFlowInstance.isRadio(mockNode)).toBe(true);
    });

    it('should return false if not an input element', () => {
      const mockNode = { tagName: 'DIV', type: 'radio' };
      expect(focusFlowInstance.isRadio(mockNode)).toBe(false);
    });

    it('should return false if not a radio type', () => {
      const mockNode = { tagName: 'INPUT', type: 'checkbox' };
      expect(focusFlowInstance.isRadio(mockNode)).toBe(false);
    });
  });

  describe('isCheckbox', () => {
    it('should return true for a checkbox input element', () => {
      const mockNode = { tagName: 'INPUT', type: 'checkbox' };
      expect(focusFlowInstance.isCheckbox(mockNode)).toBe(true);
    });

    it('should return false if not an input element', () => {
      const mockNode = { tagName: 'DIV', type: 'checkbox' };
      expect(focusFlowInstance.isCheckbox(mockNode)).toBe(false);
    });

    it('should return false if not a checkbox type', () => {
      const mockNode = { tagName: 'INPUT', type: 'radio' };
      expect(focusFlowInstance.isCheckbox(mockNode)).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return true if activator is checked', () => {
      const mockActivator = { checked: true };
      // For methods that might be called on the instance and rely on `this.nodelist`
      // we might need to mock that part of the instance if not passing activator directly
      const ff = new FocusFlowClass.constructor(); // Create a new instance
      ff.nodelist = { activator: mockActivator }; // Mock nodelist
      expect(ff.isEnabled()).toBe(true);
    });

    it('should return false if activator is not checked', () => {
      const mockActivator = { checked: false };
      const ff = new FocusFlowClass.constructor();
      ff.nodelist = { activator: mockActivator };
      expect(ff.isEnabled()).toBe(false);
    });

    it('should return false if activator is null', () => {
       const ff = new FocusFlowClass.constructor();
       ff.nodelist = { activator: null };
      expect(ff.isEnabled()).toBe(false);
    });

    it('should use provided activator if passed directly', () => {
      const mockActivator = { checked: true };
      const ff = new FocusFlowClass.constructor();
      // nodelist.activator could be something else or null
      ff.nodelist = { activator: { checked: false } };
      expect(ff.isEnabled(mockActivator)).toBe(true);

      const mockActivator2 = { checked: false };
      expect(ff.isEnabled(mockActivator2)).toBe(false);

      expect(ff.isEnabled(null)).toBe(false);
    });
  });
});
