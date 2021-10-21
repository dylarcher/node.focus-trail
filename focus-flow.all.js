// configurations for plugin
const options = {
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
  inputNodes: ['input', 'textarea', 'select'],
  requiredStyles: {
  	// styles to always include/reset
    outline: '2px solid',
    outlineColor: 'currentColor',
    transform: 'scale(1)'
  }
}

class Event {
  constructor({ add, remove, controller = new AbortController(), target = window }) {
    this.controller = controller
    this.target = target
    this.type = {
      add,
      remove
    }
  }
  cancel() {
    // execute controller's abort method
    this.controller.abort()
    // return Event for chaining
    return this
  }
  unsubscribe() {
    // rerun subscribe method with 'remove' stack
    this.subscribe(this.listener, this.options, 'remove')
    // return Event for chaining
    return this
  }
  subscribe(listener, options = {}, stack = 'add') {
    // assign listener to Event
    this.listener = listener
    // assign options to Event
    this.options = {
      capture: options.capture || false,
      once: options.once || false,
      signal: this.controller.signal
    }
    // ensure event type(s) are wrapper in array
    const types = !Array.isArray(this.type[stack]) ? [this.type[stack]] : this.type[stack]
    // iterate each event type
    for (const type of types) {
      // assign passive on scroll to Event options
      this.options.passive = options.passive || type === 'scroll'
      // intilize listener on event type, include options
      this.target[`${stack}EventListener`](type, this.listener, this.options)
    }
    // return Event for chaining
    return this
  }
}

class Helper {
  convertToRem(numerator) {
    // html eleemnt
    const root = document.documentElement
    // base font size
    const font = getComputedStyle(root).fontSize
    // convert to number
    const denominator = parseFloat(font)
    // divide and append 'rem'
    return `${numerator / denominator}rem`
  }
  isObject(obj) {
  	// is defined, type object, and not array
  	return obj && typeof obj === 'object' && !Array.isArray(obj)
  }
}

class Iterator {
  map(obj, fn) {
  	let head, tail
    // when object
  	if (new Helper().isObject(obj)) {
    	// namespace head with first keyname
      head = Object.keys(obj)[0]
      // tail contains remaining entries, without head
      const { [head]: value, ...tail } = obj
      // check head & tail value status, return object
      return !head && !Object
        .values(tail)
        .length ? {} : {
        	// recursively rerun remaining entries
          ...this.map(tail, fn),
          // pass head value to callback
          [head]: fn(value, head)
        }
    }
    // when not object (e.g. map, set, array, or string)
    // namespace 0 index to head, remaining to tail
    [head, ...tail] = obj
    // check head & tail status, return array
    return !head && !tail.length ? [] : [
    	// recursively rerun remaining entries
      ...this.map(tail, fn),
      // pass head to callback
      fn(head)
    ]
  }
  filter(obj, fn) {
  	let head, tail
    // when object
  	if (new Helper().isObject(obj)) {
    	// namespace head with first keyname
      head = Object.keys(obj)[0]
      // tail contains remaining entries, without head
      const { [head]: value, ...tail } = obj
      // check head & tail value status
      return !head ? {} : fn(value, head)
      	// recursively rerun remaining entries & merge with head entry
        ? { [head]: value, ...this.filter(tail, fn) }
      	// recursively rerun remaining entries
        : { ...this.filter(tail, fn) }
    }
    // when not object (e.g. map, set, array, or string)
    // namespace 0 index to head, remaining to tail
    [head, ...tail] = obj
    // check head & tail status
    return !head ? [] : fn(head) ?
    	// recursively rerun remaining entries & concat with head
      [head, ...this.filter(tail, fn)] :
    	// recursively rerun remaining entries
      [...this.filter(tail, fn)]
  }
  reduce(obj, fn, acc = {}) {
  	let head, tail
    // when object
  	if (new Helper().isObject(obj)) {
    	// namespace head with first keyname
      head = Object.keys(obj)[0]
      // tail contains remaining entries, without head
      const { [head]: value, ...tail } = obj
      // recursively rerun remaining entries, return acc if head is null
      return !head ? acc : this.reduce(tail, fn, fn(acc, value, head))
    }
    // when not object (e.g. map, set, array, or string)
    // namespace 0 index to head, remaining to tail
    [head, ...tail] = obj
    // recursively rerun remaining entries, return acc if head is null
    return !head ? acc : this.reduce(tail, fn, fn(acc, head))
  }
}

class Query {
  allFocusableNodes(parent = options.app) {
  	// convert nodelist to array & return
    return [...(
    	// if parent is null, use document
      document.querySelector(parent) ||
      document
    // query all focusable elements
    ).querySelectorAll(options
       .focusable
       .include
       // map focusable selectors to query
       .map((name) => `${name}${options
         .focusable
         .exclude
         // map excludes to focusable selectors
         .map(attr => `:not(${attr})`)
         // stringify excludes
         .join('')}`)
       // stringify selectors with excludes with delimiter
       .join(', '))]
  }
  activeNodeState(target = document.activeElement) {
    let { // get position of target
    	top, left, width, height
    } = target.getBoundingClientRect()
    const { // get some styles from target
    	color, borderRadius
    } = getComputedStyle(target)
    return { // return object of style key/value pairs
    	// include position styles
    	...(new Iterator()).map({
        top, left, width, height
      // convert values to rem
      }, (new Helper()).convertToRem),
      // include default styles
      ...options.requiredStyles,
      // include target styles 
      borderRadius, color
    }
  }
}

class FocusFlow {
  constructor({ selector, actionKey, wrapper }) {
    this.selector = selector
    // designate action key (e.g. tab keycode is 9)
    this.actionKey = actionKey
    this.wrapper = ( // designate wrapper
      document.querySelector(wrapper) ||
      document.body
    )
    // get node, if able
    this.node = this
    	.wrapper
      .querySelector(selector)
  }

  mountNode() {
    // check for # or . to determine selector type
    const isId = this.selector.includes('#')
    const isClass = this.selector.includes('.')
    // remove # or . if present
    const name = isId || isClass
      ? this.selector.substring(1)
      : this.selector
    // assign name to class or id string
    const type = isId && `id="${name}"` ||
      isClass && `class="${name}"` || ''
    // html template string for tail node
    const html = `<div ${type} role="presentation" />`
    // insert tail div, before closing tag of wrapper
    this.wrapper.insertAdjacentHTML('beforeend', html)
    // return FocusFlow for chaining
    return this
  }

  focusFlow(self = this) {
    return function (event) {
      // if node is not yet created
      if (!self.node) {
      	// mount node
        self.mountNode()
        // assign newly placed element
        self.node = self.wrapper.querySelector(self.selector)
      }
      // event type check
      const eventType = event.type
      // tail node style object
			const flowStyle = self.node.style
      // reusable target variable
      const target = event.target
      // click events condition
			const click = eventType === 'click'
      // initialize Query instance
      const query = new Query()
      // ensure activeElement is a focusable node
      const match = query
      	.allFocusableNodes()
        .includes(target)
      // while users typing with tab key
      const tabPress = (
      	eventType === 'keyup' &&
        event.which === self.actionKey
      )
      // checks for user input elements
      const formField = options
      	.inputNodes
        .includes(target.localName)
      // if window resizes or scrolls
      const windowMoved = [
      	'resize',
        'scroll'
      ].includes(eventType)
      // on window move or unfocusable node click
      if (windowMoved || (click && !match)) {
      	// shrink tail node so it's hidden, return out
        return Object.assign(flowStyle, { transform: 'scale(0.001)' })
      }
      // on tab or click of a focusable element
      if ((tabPress || click) && match) {
      	// get user input parent selectors
      	const inputWrapper = options.form.fieldWrapper
        // user input area is active while parent selector is avaliable
        const inputFieldParent = formField && inputWrapper && inputWrapper.length
      	// if user input area, wrap parentNode
        return inputFieldParent
        	? Object.assign(flowStyle, {
            // get active node
            ...query.activeNodeState(target
              // get active node parent
              .closest(inputWrapper)
            // get active node parent color
            ), color: getComputedStyle(target).color
          }) // if not user input area, only interactable, wrap activeNode
          : Object.assign(flowStyle, query.activeNodeState())
      }
    }
  }
}

const activateOn = options.events.attach

// create trail instance
const tail = new FocusFlow({
	wrapper: options.app,
  selector: options.selector,
  actionKey: activateOn.keys.tab
})

// new event instance with add/remove options
const emit = new Event({
  add: activateOn.types
})

// make body unfocusable
document.body.setAttribute('tabindex', '-1')

// emit/init subscription to FocusFlow
emit.subscribe(tail.focusFlow())
