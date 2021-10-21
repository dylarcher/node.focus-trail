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

export default new Event
