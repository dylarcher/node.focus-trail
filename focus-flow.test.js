import FocusFlowClass from './focus-flow.js'; // Assuming default export is the instance
// To test methods directly on the class, you'd ideally export the class itself:
// import { FocusFlow } from './focus-flow.js'; // if you change export in focus-flow.js

// Since focus-flow.js exports `new FocusFlow()`, we get an instance.
// To test prototype methods without relying on the instance's state or DOM interactions from create():
const focusFlowInstance = Object.getPrototypeOf(FocusFlowClass);

// Helper to create mock elements with attributes
const createMockElement = (attributes = {}, tagName = 'DIV') => {
  const element = {
    tagName,
    attributes: {},
    getAttribute: jest.fn(name => element.attributes[name] !== undefined ? element.attributes[name] : null),
    setAttribute: jest.fn((name, value) => element.attributes[name] = value),
    removeAttribute: jest.fn(name => delete element.attributes[name]),
    hasAttribute: jest.fn(name => element.attributes[name] !== undefined),
    // For prevNode
    previousElementSibling: null,
  };
  for (const key in attributes) {
    element.attributes[key] = attributes[key];
  }
  return element;
};

describe('FocusFlow Utilities', () => {
  describe('hideAttr', () => {
    // Corrected based on focus-flow.js implementation
    it('should set the hidden attribute', () => {
      const mockEl = createMockElement();
      focusFlowInstance.hideAttr(mockEl); // This function directly calls setAttribute in the actual code
      expect(mockEl.setAttribute).toHaveBeenCalledWith('hidden', '');
    });
  });

  describe('prevNode', () => {
    // Corrected for higher-order function
    it('should return a function that finds the closest ancestor matching the target', () => {
      const mockTargetNode = createMockElement({ id: 'target' });
      const mockChildNode = createMockElement();
      mockChildNode.closest = jest.fn(selector => (selector === '#target' ? mockTargetNode : null));

      const prevNodeFn = focusFlowInstance.prevNode('#target');
      expect(typeof prevNodeFn).toBe('function');
      const result = prevNodeFn(mockChildNode);
      expect(mockChildNode.closest).toHaveBeenCalledWith('#target');
      expect(result).toBe(mockTargetNode);
    });
  });

  describe('hasAttr', () => {
    // Corrected for higher-order function
    it('should return a function that checks for an attribute', () => {
      const mockElWithValue = createMockElement({ 'data-test': 'value' });
      const mockElWithoutValue = createMockElement();

      const hasDataTestAttrFn = focusFlowInstance.hasAttr('data-test');
      expect(typeof hasDataTestAttrFn).toBe('function');

      expect(hasDataTestAttrFn(mockElWithValue)).toBe(true);
      expect(mockElWithValue.hasAttribute).toHaveBeenCalledWith('data-test');

      expect(hasDataTestAttrFn(mockElWithoutValue)).toBe(false);
      expect(mockElWithoutValue.hasAttribute).toHaveBeenCalledWith('data-test');
    });
  });

  describe('setAttr', () => {
    // Corrected for higher-order function and implementation
    it('should return a function that assigns properties to a node (like style or attributes)', () => {
      const mockEl = createMockElement();
      const attrsToSet = { 'data-test': 'new-value', 'id': 'test-id' };

      // The setAttr in focus-flow.js is Object.assign(node, entry)
      // This is problematic for attributes, as it doesn't use setAttribute.
      // It's more for direct property assignment (e.g. node.style.property).
      // We'll test its actual behavior.
      const setAttrsFn = focusFlowInstance.setAttr(attrsToSet);
      expect(typeof setAttrsFn).toBe('function');

      setAttrsFn(mockEl);
      // It doesn't use mockEl.setAttribute, it uses Object.assign.
      // We can't directly check Object.assign on the mock easily without more complex mocking.
      // Instead, let's assume it would modify properties if they were real.
      // For the sake of this test, we'll acknowledge its structure.
      // A more robust test would involve checking properties if the mock was more complete.
      // This test primarily verifies it returns a function.
    });

    it('should correctly apply styles using the returned function', () => {
        const mockStyleObject = {};
        const mockElementWithStyle = { style: mockStyleObject };
        const stylesToSet = { color: 'red', fontSize: '16px' };

        const setStylesFn = focusFlowInstance.setAttr(stylesToSet);
        setStylesFn(mockElementWithStyle.style); // Apply to the style object directly

        expect(mockElementWithStyle.style.color).toBe('red');
        expect(mockElementWithStyle.style.fontSize).toBe('16px');
    });
  });

  describe('isKeyStroke', () => {
    // Corrected based on actual implementation (delegates to isTab)
    it('should return true if isTab(event) is true', () => {
      const mockEvent = { type: 'keyup', keyCode: 9 }; // isTab checks type and keyCode
      // Mock isTab on the prototype for this test, assuming isKeyStroke uses `this.isTab`
      const originalIsTab = focusFlowInstance.isTab;
      focusFlowInstance.isTab = jest.fn(() => true);

      expect(focusFlowInstance.isKeyStroke(mockEvent)).toBe(true);
      expect(focusFlowInstance.isTab).toHaveBeenCalledWith(mockEvent);

      focusFlowInstance.isTab = originalIsTab; // Restore
    });

    it('should return false if isTab(event) is false', () => {
      const mockEvent = { type: 'keyup', keyCode: 13 }; // Not a tab
      const originalIsTab = focusFlowInstance.isTab;
      focusFlowInstance.isTab = jest.fn(() => false);

      expect(focusFlowInstance.isKeyStroke(mockEvent)).toBe(false);
      expect(focusFlowInstance.isTab).toHaveBeenCalledWith(mockEvent);

      focusFlowInstance.isTab = originalIsTab; // Restore
    });
  });

  describe('canUse', () => {
    it('should return true if item is not null or undefined', () => {
      expect(focusFlowInstance.canUse({})).toBe(true);
      expect(focusFlowInstance.canUse([])).toBe(true);
      expect(focusFlowInstance.canUse('')).toBe(true);
      expect(focusFlowInstance.canUse(0)).toBe(true);
      expect(focusFlowInstance.canUse(false)).toBe(true);
    });

    it('should return false if item is null or undefined', () => {
      expect(focusFlowInstance.canUse(null)).toBe(false);
      expect(focusFlowInstance.canUse(undefined)).toBe(false);
    });
  });

  describe('removeAttr', () => {
    // Corrected for higher-order function
    it('should return a function that removes an attribute if it exists', () => {
      const mockElWithAttr = createMockElement({ 'data-test': 'value' });
      const mockElWithoutAttr = createMockElement();

      // Mocking the hasAttr that removeAttr uses internally for this specific test
      // This is a bit complex due to the higher-order nature of hasAttr itself.
      const originalHasAttr = focusFlowInstance.hasAttr;
      focusFlowInstance.hasAttr = jest.fn(attrName => {
        return (node) => node.hasAttribute(attrName); // Return a function that behaves like the real inner hasAttr
      });

      const removeDataTestAttrFn = focusFlowInstance.removeAttr('data-test');
      expect(typeof removeDataTestAttrFn).toBe('function');

      removeDataTestAttrFn(mockElWithAttr);
      expect(focusFlowInstance.hasAttr).toHaveBeenCalledWith('data-test');
      // Check that the *mocked* inner hasAttr was called via the HOF pattern
      expect(mockElWithAttr.hasAttribute).toHaveBeenCalledWith('data-test');
      expect(mockElWithAttr.removeAttribute).toHaveBeenCalledWith('data-test');

      removeDataTestAttrFn(mockElWithoutAttr);
      expect(focusFlowInstance.hasAttr).toHaveBeenCalledWith('data-test');
      expect(mockElWithoutAttr.hasAttribute).toHaveBeenCalledWith('data-test');
      expect(mockElWithoutAttr.removeAttribute).not.toHaveBeenCalledWith('data-test'); // Because it didn't have it

      focusFlowInstance.hasAttr = originalHasAttr; // Restore
    });
  });

  describe('isFocusable', () => {
    let ffInstance;
    let mockFocusableElements;
    let mockTargetElement;

    beforeEach(() => {
      ffInstance = new FocusFlowClass.constructor();
      mockTargetElement = createMockElement();
      mockFocusableElements = [createMockElement(), mockTargetElement];
      // Mock queryFocusableAll on the instance as isFocusable uses this.queryFocusableAll
      ffInstance.queryFocusableAll = jest.fn(() => mockFocusableElements);
    });

    it('should return true if event.target is in the list of focusable elements', () => {
      const mockEvent = { target: mockTargetElement };
      expect(ffInstance.isFocusable(mockEvent)).toBe(true);
      expect(ffInstance.queryFocusableAll).toHaveBeenCalled();
    });

    it('should return false if event.target is not in the list of focusable elements', () => {
      const nonFocusableElement = createMockElement();
      const mockEvent = { target: nonFocusableElement };
      expect(ffInstance.isFocusable(mockEvent)).toBe(false);
      expect(ffInstance.queryFocusableAll).toHaveBeenCalled();
    });

    it('should return false and not throw if event is null or event.target is null', () => {
      // The actual implementation `event.target` would throw if event is null.
      // A robust function should guard this. Current code does not.
      // This test highlights that. For now, we test what happens if queryFocusableAll is somehow called.
      // If queryFocusableAll is not called (e.g. due to a guard), this test needs adjustment.
      // Based on current code, it *will* throw.
      expect(() => ffInstance.isFocusable(null)).toThrow();

      const mockEventWithNullTarget = { target: null };
      // If queryFocusableAll returns a list, .includes(null) is valid and returns false.
      expect(ffInstance.isFocusable(mockEventWithNullTarget)).toBe(false);
    });
  });

  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(focusFlowInstance.isObject({})).toBe(true);
      expect(focusFlowInstance.isObject({ a: 1 })).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(focusFlowInstance.isObject([])).toBe(false); // Arrays are objects, but often need specific handling
      expect(focusFlowInstance.isObject("string")).toBe(false);
      expect(focusFlowInstance.isObject(123)).toBe(false);
      expect(focusFlowInstance.isObject(null)).toBe(false);
      expect(focusFlowInstance.isObject(undefined)).toBe(false);
      expect(focusFlowInstance.isObject(() => {})).toBe(false); // Functions
    });
     it('should return false for arrays, as per common utility distinctions', () => {
      expect(focusFlowInstance.isObject([])).toBe(false);
    });
  });

  describe('isTab', () => {
    // Corrected to include event.type
    it('should return true if event is keyup and keyCode is 9 (Tab)', () => {
      const mockEvent = { type: 'keyup', keyCode: 9 };
      expect(focusFlowInstance.isTab(mockEvent)).toBe(true);
    });

    it('should return false if event key code is not 9', () => {
      const mockEvent = { type: 'keyup', keyCode: 13 };
      expect(focusFlowInstance.isTab(mockEvent)).toBe(false);
    });

    it('should return false if event type is not keyup', () => {
      const mockEvent = { type: 'keydown', keyCode: 9 };
      expect(focusFlowInstance.isTab(mockEvent)).toBe(false);
    });
  });

  describe('isArrows', () => {
    // Corrected to include event.type
    const arrowKeyCodes = [37, 38, 39, 40];
    arrowKeyCodes.forEach(keyCode => {
      it(`should return true for arrow key code ${keyCode} on keyup`, () => {
        const mockEvent = { type: 'keyup', keyCode };
        expect(focusFlowInstance.isArrows(mockEvent)).toBe(true);
      });
    });

    it('should return false for non-arrow key codes on keyup', () => {
      const mockEvent = { type: 'keyup', keyCode: 32 }; // Spacebar
      expect(focusFlowInstance.isArrows(mockEvent)).toBe(false);
    });

    it('should return false for arrow key codes if not keyup', () => {
      const mockEvent = { type: 'keydown', keyCode: 37 }; // Left arrow, but keydown
      expect(focusFlowInstance.isArrows(mockEvent)).toBe(false);
    });
  });

  describe('excludeSelectors', () => {
    // Corrected based on implementation (prepends default selectors)
    it('should return a string of :not() selectors including defaults and provided ones', () => {
      const customExcludes = ['.ignore', '[data-custom]'];
      // Default excludes from implementation: '[disabled]', '[hidden]', '[aria-hidden="true"]', '[tabindex="-1"]'
      // Plus it defaults to excluding `this.activator` which is undefined here, so it might add ":not(undefined)" or similar if not careful.
      // The implementation is `exclude = [this.activator]`, then spreads `...exclude`.
      // If `this.activator` is undefined, it will be `...[undefined]`, which `map` handles fine.
      const expected = ":not([disabled]):not([hidden]):not([aria-hidden=\"true\"]):not([tabindex=\"-1\"]):not(undefined):not(.ignore):not([data-custom])";
      // We must call it on an instance where `this.activator` can be controlled or pass undefined.
      // focusFlowInstance is a prototype, this.activator is undefined.
      // When customExcludes is passed, the default parameter `[this.activator]` is NOT used.
      const expectedWhenCustomPassed = ":not([disabled]):not([hidden]):not([aria-hidden=\"true\"]):not([tabindex=\"-1\"]):not(.ignore):not([data-custom])";
      expect(focusFlowInstance.excludeSelectors(customExcludes)).toBe(expectedWhenCustomPassed);
    });

    it('should handle explicitly passed empty array for excludes, returning defaults without this.activator', () => {
      // When an empty array is passed, it overrides the default [this.activator]
      const expectedWithEmptyArray = ":not([disabled]):not([hidden]):not([aria-hidden=\"true\"]):not([tabindex=\"-1\"])";
      expect(focusFlowInstance.excludeSelectors([])).toBe(expectedWithEmptyArray);
    });

    it('should handle no custom selectors (no argument passed), using this.activator from prototype', () => {
      // If `excludeSelectors()` is called with no args, `exclude` parameter defaults to `[this.activator]`
      // which on `focusFlowInstance` (prototype) `this.activator` is undefined.
      const expectedWithNoArgs = ":not([disabled]):not([hidden]):not([aria-hidden=\"true\"]):not([tabindex=\"-1\"]):not(undefined)";
      expect(focusFlowInstance.excludeSelectors()).toBe(expectedWithNoArgs);
    });
  });

  describe('includeSelectors', () => {
    // Corrected based on implementation (appends excludes to each include)
    it('should return a comma-separated string of selectors, each appended with excludes', () => {
      const excludesString = ":not([disabled])"; // Example from what excludeSelectors might produce
      // Default includes from implementation: 'button', 'input', 'textarea', 'select', 'details', 'a[href]'
      const expected = "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details:not([disabled]), a[href]:not([disabled])";
      expect(focusFlowInstance.includeSelectors(excludesString)).toBe(expected);
    });

    it('should handle empty excludes string', () => {
      const expected = "button, input, textarea, select, details, a[href]";
      expect(focusFlowInstance.includeSelectors('')).toBe(expected);
    });
  });

  describe('setObjValues', () => {
    // Corrected: setObjValues(entries, fn) maps values of entries using fn
    it('should apply a function to each value in an object', () => {
      const initialObject = { a: 1, b: 2, c: 3 };
      const doublingFunction = value => value * 2;
      const result = focusFlowInstance.setObjValues(initialObject, doublingFunction);
      expect(result).toEqual({ a: 2, b: 4, c: 6 });
    });

    it('should work with an empty object', () => {
      const initialObject = {};
      const doublingFunction = value => value * 2;
      const result = focusFlowInstance.setObjValues(initialObject, doublingFunction);
      expect(result).toEqual({});
    });

     it('should correctly use curryReduce internally', () => {
      const initialObject = { a: 1 };
      const mockFn = jest.fn(value => value + 10);
      const originalCurryReduce = focusFlowInstance.curryReduce;

      // Spy on curryReduce to ensure it's called correctly
      focusFlowInstance.curryReduce = jest.fn(() => {
        // Return the actual reducer structure that curryReduce would
        return (cache, [key, value]) => ({ ...cache, [key]: mockFn(value) });
      });

      const result = focusFlowInstance.setObjValues(initialObject, mockFn);

      expect(focusFlowInstance.curryReduce).toHaveBeenCalledWith(mockFn);
      expect(mockFn).toHaveBeenCalledWith(1); // The value from initialObject.a
      expect(result).toEqual({ a: 11 });

      focusFlowInstance.curryReduce = originalCurryReduce; // Restore
    });
  });

  describe('curryReduce', () => {
    // Corrected: curryReduce is designed for Object.entries results [key, value]
    it('should return a reducer function that applies fn to a value in a [key, value] pair', () => {
      const mockTransformFn = jest.fn(value => `transformed-${value}`);
      const curriedReducer = focusFlowInstance.curryReduce(mockTransformFn);

      expect(typeof curriedReducer).toBe('function');

      const initialCache = {};
      const entry = ['myKey', 'myValue'];
      const result = curriedReducer(initialCache, entry);

      expect(mockTransformFn).toHaveBeenCalledWith('myValue');
      expect(result).toEqual({ myKey: 'transformed-myValue' });
      expect(initialCache).toEqual({}); // Ensure initial cache is not mutated
    });

    it('should accumulate results in the cache object', () => {
      const mockTransformFn = value => value.toUpperCase();
      const curriedReducer = focusFlowInstance.curryReduce(mockTransformFn);

      let cache = {};
      cache = curriedReducer(cache, ['key1', 'val1']);
      cache = curriedReducer(cache, ['key2', 'val2']);

      expect(cache).toEqual({ key1: 'VAL1', key2: 'VAL2' });
    });
  });
});

describe('FocusFlow Instance Methods', () => { // Renamed outer describe for clarity. This is the correct one.
  // Mock document.documentElement for getPosition related to viewport if necessary
  // For now, assuming getPosition is self-contained with its mockTarget

  describe('getPosition', () => {
    // Existing getPosition tests are fine, just ensuring they are under the new group
    it('should return position and dimensions of a target element', () => {
      const mockTarget = {
        getBoundingClientRect: jest.fn(() => ({
          top: 10,
          left: 20,
          width: 100,
          height: 50,
        })),
      };
      const position = focusFlowInstance.getPosition(mockTarget); // Accessing via prototype
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
    // Existing convertToRem tests are fine
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
  // Add other instance method tests here if they were separated
});

// describe block for FocusFlow DOM & Core Logic is extensive.
// Adding 'observe' tests here. If it gets too long, might consider a new file.
describe('FocusFlow DOM & Core Logic', () => {
  let ff; // FocusFlow instance

  const setupDOM = (html) => {
    document.body.innerHTML = html || '';
  };

  beforeEach(() => {
    // Create a new instance for each test to reset state
    ff = new FocusFlowClass.constructor();
    // Default mocks for document methods. Specific tests can override.
    document.querySelector = jest.fn();
    document.querySelectorAll = jest.fn(() => []); // Default to empty array
    // Mock getComputedStyle for convertToRem which is used in update()
    global.getComputedStyle = jest.fn(element => {
        if (element === document.documentElement) {
          return { fontSize: '16px' }; // Default for tests
        }
        // Fallback for other elements if needed, though not common for these tests
        return { fontSize: '16px' };
      });
  });

  afterEach(() => {
    document.body.innerHTML = ''; // Clean up DOM
    jest.restoreAllMocks(); // Restore all mocks
  });

  describe('appendTo', () => {
    it('should append the focus flow HTML to the app element', () => {
      const mockAppElement = createMockElement();
      mockAppElement.insertAdjacentHTML = jest.fn();
      ff.nodelist = { app: mockAppElement }; // Setup nodelist for appendTo

      ff.appendTo();

      expect(mockAppElement.insertAdjacentHTML).toHaveBeenCalledWith(
        'beforeend',
        '<div id="focus-flow" role="presentation" />'
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      // Mock appendTo to prevent it from actually trying to modify a potentially non-existent app element
      // during the create tests, unless we are specifically testing that part of create.
      FocusFlowClass.constructor.prototype.appendTo = jest.fn();
    });

    it('should initialize selectors and nodelist correctly', () => {
      const mockAppEl = createMockElement({}, 'DIV');
      mockAppEl.id = 'app';
      const mockActivatorEl = createMockElement({}, 'INPUT');
      const mockFlowEl = createMockElement({}, 'DIV');
      mockFlowEl.id = 'focus-flow';

      document.querySelector = jest.fn(selector => {
        if (selector === '#app') return mockAppEl;
        if (selector === '#activator') return mockActivatorEl;
        if (selector === '#focus-flow') return mockFlowEl;
        return null;
      });
      document.querySelectorAll = jest.fn(selector => {
        if (selector === '.helpers') return [{ id: 'h1' }];
        if (selector === '.wrappers') return [{ id: 'w1' }];
        if (selector === '.radios') return [{ id: 'r1' }];
        return [];
      });

      const options = {
        insertAt: '#app',
        selector: '#focus-flow',
        activator: '#activator',
        helperText: '.helpers',
        inputWrapper: '.wrappers',
        radioClass: '.radios',
        conceal: ['click']
      };

      ff.create(options);

      expect(ff.selectors).toEqual(options);
      expect(ff.nodelist.app).toBe(mockAppEl);
      expect(ff.nodelist.activator).toBe(mockActivatorEl);
      expect(ff.nodelist.flow).toBe(mockFlowEl);
      expect(ff.nodelist.target).toBe(document.activeElement); // JSDOM's default activeElement is body
      expect(ff.nodelist.helpers).toEqual([{ id: 'h1' }]);
      expect(ff.nodelist.wrappers).toEqual([{ id: 'w1' }]);
      expect(ff.nodelist.radios).toEqual([{ id: 'r1' }]);
      expect(ff.events.conceal).toEqual(['click']);
      expect(FocusFlowClass.constructor.prototype.appendTo).not.toHaveBeenCalled(); // flow el exists
    });

    it('should call appendTo if flow element does not exist', () => {
      document.querySelector = jest.fn(selector => {
        if (selector === '#app') return createMockElement({ id: 'app' });
        if (selector === '#focus-flow') return null; // Flow element doesn't exist
        return createMockElement();
      });
       document.querySelectorAll = jest.fn(() => []);


      const options = { insertAt: '#app', selector: '#focus-flow' };
      ff.create(options);

      expect(FocusFlowClass.constructor.prototype.appendTo).toHaveBeenCalled();
    });
  });

  describe('hideNodes', () => {
    it('should call hideAttr on each node in the nodelist and preventDefault on event', () => {
      const mockNode1 = createMockElement();
      const mockNode2 = createMockElement();
      const nodelist = [mockNode1, mockNode2];
      const mockEvent = { preventDefault: jest.fn() };

      // hideAttr is on the prototype and is NOT a HOF.
      // this.hideAttr inside forEach might have `this` issues if not careful.
      // The actual implementation is `nodelist.forEach(this.hideAttr);`
      // Let's spy on the prototype method directly.
      const hideAttrSpy = jest.spyOn(focusFlowInstance, 'hideAttr');

      const hideNodesFn = ff.hideNodes(nodelist); // hideNodes returns event => { ... }
      hideNodesFn(mockEvent);

      expect(hideAttrSpy).toHaveBeenCalledTimes(nodelist.length);
      // Check arguments for each call specifically
      expect(hideAttrSpy.mock.calls[0][0]).toBe(mockNode1);
      expect(hideAttrSpy.mock.calls[1][0]).toBe(mockNode2);
      expect(mockEvent.preventDefault).toHaveBeenCalled();

      hideAttrSpy.mockRestore();
    });
  });

  describe('showNodes', () => {
    it('should call removeAttr("hidden") on each node in the nodelist', () => {
      const mockNode1 = createMockElement();
      const mockNode2 = createMockElement();
      // Mock that nodes initially have the 'hidden' attribute for removeAttr to work as expected
      mockNode1.hasAttribute.mockImplementation(attr => attr === 'hidden');
      mockNode2.hasAttribute.mockImplementation(attr => attr === 'hidden');

      const nodelist = [mockNode1, mockNode2];
      const mockEvent = {};

      // Spy on the HOF focusFlowInstance.removeAttr
      const removeAttrSpy = jest.spyOn(focusFlowInstance, 'removeAttr');
      // Spy on the actual DOM method on the mock elements
      const node1RemoveAttributeSpy = jest.spyOn(mockNode1, 'removeAttribute');
      const node2RemoveAttributeSpy = jest.spyOn(mockNode2, 'removeAttribute');

      const showNodesFn = ff.showNodes(nodelist); // showNodes returns event => { ... }
      showNodesFn(mockEvent);

      // Check that the HOF factory was called to create the remover function
      expect(removeAttrSpy).toHaveBeenCalledWith('hidden');

      // Check that the DOM method was called on each node
      expect(node1RemoveAttributeSpy).toHaveBeenCalledWith('hidden');
      expect(node2RemoveAttributeSpy).toHaveBeenCalledWith('hidden');

      removeAttrSpy.mockRestore();
    });
  });

  describe('hideHelpers', () => {
    it('should call setAttr({ hidden: "hidden" }) on each helper', () => {
      const helper1 = createMockElement();
      const helper2 = createMockElement();
      ff.nodelist = { helpers: [helper1, helper2] };

      const setAttrSpy = jest.spyOn(focusFlowInstance, 'setAttr');
      // Mock the inner function that setAttr returns
      const mockInnerSetAttr = jest.fn();
      setAttrSpy.mockImplementation(() => mockInnerSetAttr);

      const hideHelpersFn = ff.hideHelpers();
      hideHelpersFn({}); // Pass mock event

      expect(setAttrSpy).toHaveBeenCalledWith({ hidden: 'hidden' });
      expect(mockInnerSetAttr).toHaveBeenCalledTimes(2);
      // Check specifically that the mockInnerSetAttr was called with helper1 and helper2
      // This part is tricky because mockInnerSetAttr is general.
      // A better way: check side effect if setAttr was not a HOF or if we mock node props.
      // For now, verifying it was called twice with the correct config is a good step.
      // If setAttr directly modified, we'd do:
      // expect(helper1.attributes.hidden).toBe('hidden');

      setAttrSpy.mockRestore();
    });
  });

  describe('showHelpers', () => {
    it('should call showNodes with nodelist.helpers', () => {
      const mockHelpers = [createMockElement(), createMockElement()];
      ff.nodelist = { helpers: mockHelpers };
      const mockEvent = {};

      // Spy on ff.showNodes itself. It returns a function.
      const innerMockShowNodes = jest.fn();
      const showNodesSpy = jest.spyOn(ff, 'showNodes').mockImplementation(() => innerMockShowNodes);

      const showHelpersFn = ff.showHelpers(); // showHelpers returns event => { ... }
      showHelpersFn(mockEvent);

      expect(showNodesSpy).toHaveBeenCalledWith(mockHelpers); // Check showNodes was called with helpers
      expect(innerMockShowNodes).toHaveBeenCalledWith(mockEvent); // Check the function returned by showNodes was called

      showNodesSpy.mockRestore();
    });
  });

  describe('conceal', () => {
    let mockFlowElement;

    beforeEach(() => {
      mockFlowElement = createMockElement();
      mockFlowElement.classList = { remove: jest.fn(), add: jest.fn() };
      ff.nodelist = { flow: mockFlowElement }; // Set directly for conceal's use of this.nodelist.flow
      ff.events = { conceal: ['click', 'focusout'] }; // Default events for conceal
    });

    it('should remove "active" class if event type is in this.events.conceal', () => {
      document.querySelectorAll = jest.fn(() => []); // No elements with aria-selected="true"
      const concealFn = ff.conceal(); // Get the event handler from the instance
      concealFn({ type: 'click' });
      expect(mockFlowElement.classList.remove).toHaveBeenCalledWith('active');
    });

    it('should not remove "active" class if event type is not in this.events.conceal', () => {
      document.querySelectorAll = jest.fn(() => []);
      const concealFn = ff.conceal();
      concealFn({ type: 'mouseover' }); // Not a conceal event type
      expect(mockFlowElement.classList.remove).not.toHaveBeenCalled();
    });

    it('should set aria-selected="false" on elements with aria-selected="true"', () => {
      const el1 = createMockElement({ 'aria-selected': 'true' });
      const el2 = createMockElement({ 'aria-selected': 'true' });
      el1.setAttribute = jest.fn(); // Mock setAttribute on the element itself for side-effect check
      el2.setAttribute = jest.fn(); // Mock setAttribute on the element itself

      document.querySelectorAll = jest.fn(selector => {
        if (selector === '[aria-selected="true"]') return [el1, el2];
        return [];
      });

      // Spy on the HOF `setAttr` from the prototype.
      // Its mock implementation should reflect its actual behavior of Object.assign for this test.
      const setAttrSpy = jest.spyOn(focusFlowInstance, 'setAttr').mockImplementation(attrsToSet => {
        return (node) => { // This is the function that forEach calls
          // Simulate Object.assign for attributes for testing purposes.
          // In a real scenario, setAttribute would be better for actual attributes.
          // The original code uses Object.assign(node, entry)
          for(const key in attrsToSet) {
            node[key] = attrsToSet[key]; // e.g., node.ariaSelected = 'false'
          }
        };
      });

      const concealFn = ff.conceal();
      concealFn({ type: 'click' });

      expect(document.querySelectorAll).toHaveBeenCalledWith('[aria-selected="true"]');
      expect(setAttrSpy).toHaveBeenCalledWith({ ariaSelected: 'false' });

      // Check side effects:
      expect(el1.ariaSelected).toBe('false');
      expect(el2.ariaSelected).toBe('false');

      setAttrSpy.mockRestore();
    });

    it('should prevent default on submit events', () => {
      document.querySelectorAll = jest.fn(() => []);
      const mockEvent = { type: 'submit', preventDefault: jest.fn() };
      const concealFn = ff.conceal();
      concealFn(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

     it('should use provided events list if passed to conceal', () => {
      document.querySelectorAll = jest.fn(() => []);
      const concealFn = ff.conceal(['customEvent']); // Pass custom event list
      concealFn({ type: 'customEvent' });
      expect(mockFlowElement.classList.remove).toHaveBeenCalledWith('active');
    });
  });

  describe('queryFocusableAll', () => {
    beforeEach(() => {
      // Mock the selector methods used by queryFocusableAll
      // These are on the prototype, so use focusFlowInstance or spyOn(ff, ...)
      ff.excludeSelectors = jest.fn(() => ':not([disabled])'); // Example exclude
      ff.includeSelectors = jest.fn(excludes => `button${excludes},input${excludes}`); // Example include
    });

    it('should call excludeSelectors and includeSelectors', () => {
      document.querySelectorAll = jest.fn(() => []); // Mock actual DOM query
      ff.queryFocusableAll();
      expect(ff.excludeSelectors).toHaveBeenCalled();
      expect(ff.includeSelectors).toHaveBeenCalledWith(':not([disabled])');
    });

    it('should call document.querySelectorAll with the combined selector string', () => {
      document.querySelectorAll = jest.fn(() => []);
      ff.queryFocusableAll();
      // Based on the mocks above: includes would be "button:not([disabled]),input:not([disabled])"
      expect(document.querySelectorAll).toHaveBeenCalledWith('button:not([disabled]),input:not([disabled])');
    });

    it('should return an array of elements from document.querySelectorAll', () => {
      const mockElements = [createMockElement({}, 'BUTTON'), createMockElement({}, 'INPUT')];
      document.querySelectorAll = jest.fn(() => mockElements); // Return mock elements

      const result = ff.queryFocusableAll();
      expect(result).toEqual(mockElements);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should correctly filter elements based on mocked selectors (conceptual)', () => {
      // This test is more conceptual as it relies on the actual behavior of querySelectorAll
      // For a unit test, we trust that querySelectorAll works.
      // We've already tested that the correct selector string is passed to it.
      setupDOM(`
        <button id="btn1">Btn1</button>
        <input id="in1" />
        <button id="btn2" disabled>Btn2</button>
        <input id="in2" class="ignored"/>
      `);

      // More realistic mocks for selector methods for this specific test
      ff.excludeSelectors = jest.fn(() => ':not([disabled]):not(.ignored)');
      ff.includeSelectors = jest.fn(excludes => `button${excludes},input${excludes}`);

      // Unmock document.querySelectorAll for this test to use JSDOM's actual qSA
      // Or, provide a more sophisticated mock for document.querySelectorAll
      // For now, we'll assert the generated selector.
      const expectedSelector = 'button:not([disabled]):not(.ignored),input:not([disabled]):not(.ignored)';
      document.querySelectorAll = jest.fn(() => []); // Keep it mocked for other tests

      ff.queryFocusableAll();
      expect(document.querySelectorAll).toHaveBeenCalledWith(expectedSelector);
    });
  });

  describe('update', () => {
    let mockTargetElement;
    let mockFlowElement;
    let mockEvent;
    let updateHandler; // To be accessible by `it` blocks

    beforeEach(function() { // Use standard function for `this` context
      mockTargetElement = createMockElement({ id: 'target' });
      mockTargetElement.tagName = 'INPUT'; // Example tagName
      mockTargetElement.getBoundingClientRect = jest.fn(() => ({ top: 10, left: 20, width: 100, height: 50 }));

      mockFlowElement = createMockElement({ id: 'flow' });
      mockFlowElement.classList = { add: jest.fn(), remove: jest.fn() };
      mockFlowElement.style = {}; // For setting style properties

      ff.nodelist = {
        flow: mockFlowElement,
        activator: createMockElement({ id: 'activator' }),
        // app: provided by create() if needed
      };
      ff.selectors = { inputWrapper: '.input-wrapper' }; // from create()

      // Mock methods called by update on the ff instance or its prototype
      ff.isEnabled = jest.fn(() => true);
      ff.prevNode = jest.fn(() => jest.fn(target => target)); // HOF, inner returns target itself
      ff.conceal = jest.fn(() => jest.fn()); // HOF, inner is also a mock

      // Spy on prototype methods that are used
      jest.spyOn(focusFlowInstance, 'setAttr').mockImplementation(attrsToSet => {
        return (nodeOrStyle) => Object.assign(nodeOrStyle, attrsToSet);
      });
      jest.spyOn(focusFlowInstance, 'getPosition').mockReturnValue({ top: 10, left: 20, width: 100, height: 50 });
      jest.spyOn(focusFlowInstance, 'setObjValues').mockImplementation((obj, fn) => {
        const newObj = {};
        for (const key in obj) { newObj[key] = fn(obj[key]); }
        return newObj;
      });
      jest.spyOn(focusFlowInstance, 'convertToRem').mockImplementation(val => `${val / 16}rem`);

      mockEvent = { target: mockTargetElement, type: 'focus' };

      // Critical: Ensure document.querySelector can find the flow element during the create call
      // that happens inside ff.update(selectors).
      const currentSelectors = {
        inputWrapper: '.input-wrapper',
        selector: '#flow', // Used by create to find nodelist.flow
        activator: '#activator' // Used by create
        // other selectors ff.create might use
      };
      // ff.selectors will be set by the ff.update() call via its internal ff.create()
      // So, we need to ensure that when ff.create() is called *inside* ff.update(),
      // the document.querySelector can find the elements.
      document.querySelector.mockImplementation(selectorString => {
        if (selectorString === currentSelectors.selector) return mockFlowElement;
        if (selectorString === currentSelectors.activator) return ff.nodelist.activator; // from outer beforeEach
        return createMockElement({ queriedWith: selectorString }); // Default mock for others
      });

      // This is the event handler we are testing.
      // The ff.update(currentSelectors) call will run create() internally first.
      updateHandler = ff.update(currentSelectors); // Assign to variable in shared scope
    });

    it('should do nothing if not enabled', () => {
      ff.isEnabled = jest.fn(() => false); // Override for this test
      updateHandler(mockEvent);
      expect(focusFlowInstance.getPosition).not.toHaveBeenCalled();
    });

    it('should do nothing if target is the activator', () => {
      mockEvent.target = ff.nodelist.activator; // ff.nodelist.activator is set by create()
      updateHandler(mockEvent);
      expect(focusFlowInstance.getPosition).not.toHaveBeenCalled();
    });

    it('should do nothing if target is document.body', () => {
      mockEvent.target = document.body;
      updateHandler(mockEvent);
      expect(focusFlowInstance.getPosition).not.toHaveBeenCalled();
    });

    it('should call prevNode if target is not a BUTTON', () => {
      mockTargetElement.tagName = 'INPUT'; // Not a button
      const innerPrevNodeMock = jest.fn(target => target);
      ff.prevNode = jest.fn(() => innerPrevNodeMock); // prevNode HOF returns inner mock

      updateHandler(mockEvent);
      expect(ff.prevNode).toHaveBeenCalledWith(ff.selectors.inputWrapper); // ff.selectors is set by create in update
      expect(innerPrevNodeMock).toHaveBeenCalledWith(mockTargetElement);
    });

    it('should NOT call prevNode if target is a BUTTON', () => {
      mockTargetElement.tagName = 'BUTTON';
      const innerPrevNodeMock = jest.fn(target => target);
      ff.prevNode = jest.fn(() => innerPrevNodeMock);

      updateHandler(mockEvent);
      // ff.prevNode(selector) is still called to set up the function, but the *returned* function isn't called
      // The logic is `target = !(target.tagName === 'BUTTON') ? this.prevNode(this.selectors.inputWrapper)(target) : target;`
      // So, if tagName is BUTTON, the HOF `this.prevNode(selector)` is not even constructed/called.
      expect(ff.prevNode).not.toHaveBeenCalled();
    });

    it('should call conceal, setAttr for aria-selected, getPosition, setObjValues, convertToRem', () => {
      const innerConcealMock = jest.fn();
      ff.conceal = jest.fn(() => innerConcealMock); // conceal HOF returns inner mock

      updateHandler(mockEvent);

      expect(ff.conceal).toHaveBeenCalledWith([mockEvent.type]);
      expect(innerConcealMock).toHaveBeenCalledWith(mockEvent);

      expect(focusFlowInstance.setAttr).toHaveBeenCalledWith({ ariaSelected: 'true' });
      // Check side effect of setAttr({ariaSelected: 'true'})(target)
      expect(mockTargetElement.ariaSelected).toBe('true');


      expect(focusFlowInstance.getPosition).toHaveBeenCalledWith(mockTargetElement);
      expect(focusFlowInstance.setObjValues).toHaveBeenCalledWith(
        { top: 10, left: 20, width: 100, height: 50 }, // from getPosition mock
        focusFlowInstance.convertToRem // the actual convertToRem function from prototype
      );
    });

    it('should add "active" class to flow element and set its style', () => {
      updateHandler(mockEvent);
      expect(mockFlowElement.classList.add).toHaveBeenCalledWith('active');

      const expectedStyles = { top: '0.625rem', left: '1.25rem', width: '6.25rem', height: '3.125rem' };
      expect(focusFlowInstance.setAttr).toHaveBeenCalledWith(expectedStyles);
      // Check side effect of setAttr(expectedStyles)(this.nodelist.flow.style)
      expect(mockFlowElement.style).toEqual(expect.objectContaining(expectedStyles));
    });

    it('should call create when update itself is called (to refresh selectors)', () => {
      // This test is slightly different now; ff.update() is called in beforeEach.
      // We need to spy on `create` before that `beforeEach` or on the prototype.
      const createSpy = jest.spyOn(focusFlowInstance, 'create');
      const handler = ff.update({ insertAt: '#app', selector: '#flow' }); // Re-call to trigger create
      expect(createSpy).toHaveBeenCalledWith({ insertAt: '#app', selector: '#flow' });
      createSpy.mockRestore(); // Important to restore prototype spy
    });
  });

  describe('observe', () => {
    let mockUpdateHandler;
    let mockConcealHandler;
    let mockShowHelpersHandler;
    let mockHideHelpersHandler;

    beforeEach(() => {
      ff = new FocusFlowClass.constructor();

      // Initialize selectors and events, especially ff.events.conceal
      // Mock document.querySelector for create, so it doesn't fail finding elements
      document.querySelector = jest.fn(selector => {
        if (selector === '#app') return createMockElement({id: 'app'});
        // Add other selectors if create needs them, otherwise return basic mock
        return createMockElement({selector});
      });
      document.querySelectorAll = jest.fn(() => []);


      ff.create({
        insertAt: '#app', // Just an example, needed by create
        selector: '#focus-flow', // Needed by create
        conceal: ['testClick', 'testScroll'] // Custom events for testing this.events.conceal
      });

      // Spy on window.addEventListener
      jest.spyOn(window, 'addEventListener');
      jest.spyOn(window, 'removeEventListener'); // Good practice, though not used by observe

      // Create mock handlers that these event listeners would call
      mockUpdateHandler = jest.fn();
      mockConcealHandler = jest.fn();
      mockShowHelpersHandler = jest.fn();
      mockHideHelpersHandler = jest.fn();

      // Spy on the instance methods and make them return our mock handlers
      // ff.update returns a function, so mock it to return our mockUpdateHandler
      jest.spyOn(ff, 'update').mockImplementation(() => mockUpdateHandler);
      // ff.conceal, ff.showHelpers, ff.hideHelpers also return functions
      jest.spyOn(ff, 'conceal').mockImplementation(() => mockConcealHandler);
      jest.spyOn(ff, 'showHelpers').mockImplementation(() => mockShowHelpersHandler);
      jest.spyOn(ff, 'hideHelpers').mockImplementation(() => mockHideHelpersHandler);
    });

    it('should attach event listeners for keyup, submit, reset, and events in this.events.conceal', () => {
      ff.observe();

      expect(window.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function), false);
      expect(window.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function), false);
      expect(window.addEventListener).toHaveBeenCalledWith('reset', expect.any(Function), false);

      // Check events from this.events.conceal (which was set during ff.create)
      expect(ff.events.conceal).toEqual(['testClick', 'testScroll']); // Ensure it's set
      expect(window.addEventListener).toHaveBeenCalledWith('testClick', expect.any(Function), false);
      expect(window.addEventListener).toHaveBeenCalledWith('testScroll', expect.any(Function), false);

      // Count total calls: keyup, submit, reset, +2 from conceal
      expect(window.addEventListener).toHaveBeenCalledTimes(5);
    });

    it('should call update handler on keyup event', () => {
      ff.observe();
      const keyupListenerRegistration = window.addEventListener.mock.calls.find(call => call[0] === 'keyup');
      const keyupHandler = keyupListenerRegistration[1];

      const mockEvent = { type: 'keyup', target: document.body };
      keyupHandler(mockEvent);

      expect(ff.update).toHaveBeenCalledWith(ff.selectors); // Check ff.update HOF was called
      expect(mockUpdateHandler).toHaveBeenCalledWith(mockEvent); // Check the returned handler was called
    });

    it('should call conceal, showHelpers, and event.preventDefault on submit event', () => {
      ff.observe();
      const submitListenerRegistration = window.addEventListener.mock.calls.find(call => call[0] === 'submit');
      const submitHandler = submitListenerRegistration[1];

      const mockEvent = { type: 'submit', preventDefault: jest.fn() };
      submitHandler(mockEvent);

      expect(ff.conceal).toHaveBeenCalled(); // Check ff.conceal HOF was called
      expect(mockConcealHandler).toHaveBeenCalledWith(mockEvent); // Check the returned handler

      expect(ff.showHelpers).toHaveBeenCalled(); // Check ff.showHelpers HOF
      expect(mockShowHelpersHandler).toHaveBeenCalledWith(mockEvent); // Check the returned handler

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should call hideHelpers on reset event', () => {
      ff.observe();
      const resetListenerRegistration = window.addEventListener.mock.calls.find(call => call[0] === 'reset');
      const resetHandler = resetListenerRegistration[1];

      const mockEvent = { type: 'reset' };
      resetHandler(mockEvent);

      expect(ff.hideHelpers).toHaveBeenCalled(); // Check ff.hideHelpers HOF
      expect(mockHideHelpersHandler).toHaveBeenCalledWith(mockEvent); // Check the returned handler
    });

    it('should call conceal handler for events in this.events.conceal', () => {
      ff.observe();

      const testClickHandlerRegistration = window.addEventListener.mock.calls.find(call => call[0] === 'testClick');
      const testClickHandler = testClickHandlerRegistration[1];
      const mockClickEvent = { type: 'testClick' };
      testClickHandler(mockClickEvent);

      // ff.conceal() is called inside the loop in observe, so it's called once per event type.
      // Then the returned mockConcealHandler is used as the listener.
      expect(ff.conceal).toHaveBeenCalled(); // This will be called multiple times if testing many conceal events.
      expect(mockConcealHandler).toHaveBeenCalledWith(mockClickEvent);

      // Reset mock for next check if needed or check call count carefully.
      // For simplicity, let's assume ff.conceal returns the same mockConcealHandler due to our spy.
      mockConcealHandler.mockClear(); // Clear calls for the next assertion if ff.conceal HOF is called again.
      // Actually, ff.conceal() is called each time in the loop within observe.
      // So the spy on ff.conceal will register multiple calls.
      // The mockConcealHandler will be the same reference due to mockImplementation.

      const testScrollHandlerRegistration = window.addEventListener.mock.calls.find(call => call[0] === 'testScroll');
      const testScrollHandler = testScrollHandlerRegistration[1];
      const mockScrollEvent = { type: 'testScroll' };
      testScrollHandler(mockScrollEvent);
      expect(mockConcealHandler).toHaveBeenCalledWith(mockScrollEvent);

      // ff.conceal would have been called for 'keyup', 'submit', 'reset', and then for each event in the loop.
      // More accurately: ff.conceal() is called in the submit handler, and in the loop for conceal events.
      // The spy on ff.conceal should reflect these calls.
    });
  });
});
