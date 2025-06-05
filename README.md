# Focus Flow Library

Focus Flow is a JavaScript library designed to enhance user experience by visually tracking focus on interactive elements within a web page. It draws a "trail" or highlight around the currently focused element, making keyboard navigation clearer and more accessible. This is particularly useful for users who rely on keyboard navigation or require visual cues for focused elements.

The library is highly configurable, allowing developers to specify which elements are focusable, how the focus trail appears, and under what conditions it activates.

## Features

-   Visual tracking of focused elements.
-   Highly configurable: define focusable elements, trail appearance (via CSS), and activation events.
-   Supports keyboard (Tab key) and mouse click focus.
-   Lightweight and designed to be integrated into various web projects.

## Demo

(Retain or update the existing demo link if available)
Demo Fiddle: https://jsfiddle.net/darcher/2Ly4dg09/

## Installation

### Prerequisites

-   Node.js and npm (or yarn) for development and bundling.

### Steps

1.  **Clone the repository (if contributing or setting up locally):**
    ```bash
    git clone <repository-url>
    cd focus-flow-project
    ```

2.  **Install npm dependencies:**
    The project includes dependencies for bundling (Webpack, Babel) and code quality (ESLint, Prettier).
    ```bash
    npm install
    ```
    If you are integrating this library as a module into another project, you might bundle it first or adjust your project's build process.

## Usage

To use the Focus Flow library, you'll typically initialize it and optionally pass configuration options.

1.  **Include the library in your HTML:**
    If you build a bundled file (e.g., `dist/bundle.js` using `npm run build`):
    ```html
    <script src="dist/bundle.js"></script>
    ```
    Alternatively, if you are using it with ES6 modules directly in a project that supports it (after appropriate setup):
    ```html
    <script type="module">
      import FocusFlow from './focus-flow.js'; // Adjust path as needed
      // ... initialization code
    </script>
    ```

2.  **Prepare your HTML structure:**
    The library typically requires a wrapper element for your application or the section where focus tracking is desired. The default configuration in `configs.js` refers to an element with `id="demo"` as the main application wrapper and `id="focus-trail"` for the focus visualizer.
    ```html
    <body>
      <div id="demo">
        <!-- Your form and interactive elements -->
        <form>
          <input type="text" id="name" />
          <button>Submit</button>
        </form>
      </div>
      <!-- The focus trail element will be appended by the script if not present,
           or you can pre-define it. -->
      <!-- <div id="focus-trail" role="presentation"></div> -->
    </body>
    ```
    Ensure your interactive elements (buttons, inputs, links, etc.) are standard HTML elements that can receive focus.

3.  **Initialize the library:**
    ```javascript
    // Assuming you have access to the FocusFlow class or its instance
    // If using the default export which is an instance:
    // import focusFlowInstance from './focus-flow.js'; // (or from your bundle)

    // If you modified focus-flow.js to export the class:
    // import FocusFlow from './focus-flow.js';

    // Example initialization (referencing the structure in focus-flow.html and configs.js)
    // This example assumes the library is set up to use configs.js internally for defaults.
    // The actual initialization might vary based on how `focus-flow.js` is structured
    // to be used as a reusable library.

    // The current focus-flow.js script exports an instance and uses `configs.js` internally.
    // The initialization is effectively done within focus-flow.html's script tag.
    // For a library usage, you'd typically do something like:

    /*
    import FocusFlow from './focus-flow.js'; // Assuming class export
    import options from './configs.js';

    const ff = new FocusFlow({
        wrapper: options.app,        // e.g., '#demo'
        selector: options.selector,  // e.g., '#focus-trail'
        // You can override other options from configs.js here
        // For example, to change activation events:
        // events: {
        //   attach: {
        //     types: ['keyup', 'click'], // Only activate on keyup and click
        //     keys: { tab: 9 }
        //   }
        // }
    });
    ff.observe(); // To start listening to events
    */

    // Given the current structure (focus-flow.js exports an instance and uses configs.js),
    // the primary way to use it is by including the script and ensuring your HTML
    // matches the selectors in configs.js, or by modifying configs.js.
    // The script in focus-flow.html demonstrates this:
    /*
      <script type="module">
        import options from '/configs.js' // Path might need adjustment
        import FocusFlow from '/focus-flow.js' // Path might need adjustment

        // The 'FocusFlow' import here is actually the pre-initialized instance.
        // The `create` method is called during its instantiation if options are passed,
        // or when `update` is first called.
        // The `observe` method is called by the instance itself if it's self-initializing,
        // or you might need to call it. In the current setup, it seems to be self-contained.

        // To customize, you would modify configs.js or the instance directly if possible.
        // For example, if the instance exposes a method to reconfigure:
        // FocusFlow.reconfigure({ selector: '#my-custom-trail' });
        // FocusFlow.observe(); // Ensure observation starts
      </script>
    */
    ```
    *Note: The current `focus-flow.js` exports `new FocusFlow()`. For typical library usage, you would export the class itself (`export class FocusFlow {...}`). The example above shows how one might initialize if the class were exported.*

## Configuration Options

The library can be configured by modifying `configs.js` or by passing an options object during initialization (if the library is structured to accept one).

Key configuration options (from `configs.js`):

*   `selector`: (String) CSS selector for the focus trail element (e.g., `'#focus-trail'`).
*   `app`: (String) CSS selector for the main application wrapper (e.g., `'#demo'`).
*   `form.fieldWrapper`: (String) CSS selector for elements that wrap form fields.
*   `events.attach.types`: (Array) Event types that trigger focus tracking (e.g., `['keyup', 'click', 'resize', 'scroll']`).
*   `events.attach.keys.tab`: (Number) Keycode for the Tab key (typically `9`).
*   `events.detach.types`: (Array) Event types that might detach or hide the trail.
*   `focusable.include`: (Array) CSS selectors for elements considered focusable (e.g., `["button", "input"]`).
*   `focusable.exclude`: (Array) CSS selectors for elements to exclude from focus tracking (e.g., `["[aria-hidden='true']", "[hidden]"]`).
*   `inputNodes`: (Array) Tag names for input elements.
*   `requiredStyles`: (Object) CSS styles applied to the focus trail element (e.g., `outline`, `transform`).

To customize, you can either:
1.  Modify `configs.js` directly before bundling/using.
2.  If the library is refactored to accept options on instantiation (e.g., `new FocusFlow(customOptions)`), you can pass them there.

## Contributing

We welcome contributions! Please follow these steps to set up your development environment:

1.  **Fork and Clone:** Fork the repository and clone your fork locally.
    ```bash
    git clone https://github.com/<your-username>/focus-flow-project.git
    cd focus-flow-project
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Development:** Make your changes to the source files (primarily `focus-flow.js`, `focus-flow.css`, etc.).
4.  **Build:** To bundle the JavaScript for testing or distribution:
    ```bash
    npm run build  # For production build (minified)
    npm run devbuild # For development build (unminified, with source maps)
    ```
5.  **Linting and Formatting:** Ensure your code adheres to the project's standards:
    ```bash
    npm run lint   # Check for linting errors
    npm run format # Automatically format code with Prettier
    ```
6.  **Testing:** Run the unit tests:
    ```bash
    npm test
    ```
    Ensure all tests pass before submitting a pull request. Add new tests for new features or bug fixes.
7.  **Pull Request:** Submit a pull request with a clear description of your changes.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details (assuming a `LICENSE` file would be created with standard MIT text).

---

*This README provides a general guide. Specific implementation details or usage instructions might vary based on the library's evolution.*
