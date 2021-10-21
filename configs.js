// configurations for plugin
export default {
  selector: '#focus-trail', // selector id
  app: '#demo', // wrapper selector
  form: {
  	// selector that wraps form fields
  	fieldWrapper: '.input'
  },
  events: {
    attach: {
      // attach listener to this event type
      types: ['keyup', 'click', 'resize', 'scroll'],
      keys: {
        tab: 9
      } // include key bindings for keyboard event limiting
    },
    detach: {
      // detach listener from these event types
      types: []
    }
  },
  focusable: {
    // selectors that are focusable
    include: [
      "button",
      "input",
      "textarea",
      "select",
      "details",
      "a[href]"
    ],
    // selectors to exclude
    exclude: [
      "[aria-hidden='true']",
      "[hidden]",
      "[disabled]",
      "[tabindex='-1']",
      ".disabled"
    ]
  },
  inputNodes: ['input', 'textarea'],
  requiredStyles: {
  	// styles to always include/reset
    outline: '2px solid',
    outlineColor: 'currentColor',
    transform: 'scale(1)'
  }
}
