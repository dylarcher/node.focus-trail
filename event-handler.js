
// configurations for plugin
const options = {
  attach: { // attach listener to this event type
  	types: "keyup",
    keys: { tab: 9 } // include key bindings for keyboard event limiting
  },
  detach: { // detach listener from these event types
	  types: ["click", "resize", "scroll"]
  }
};

class Event {

  /**
   * Event constructor instance
   * @param { Array|String } add - events to enable event listener
   * @param { Array|String } remove - events to disable event listener
   * @param { Function } controller - abort controller constructor instance
   * @param { Object|Element } target - parent node of event
   */
  constructor({
    add,
    remove,
    controller = new AbortController(),
    target = window
  }) {
    this.controller = controller
    this.target = target
    this.type = { add, remove }
  }

  // Cancel an in-progress event
  cancel(controller = this.controller) {

    // execute controller's abort method
    controller.abort()
    
    // return Event for chaining
    return this
  }
  
  // Unsubscribe from events
  unsubscribe() {
  
  	// rerun subscribe method with 'remove' stack
  	this.subscribe(this.listener, this.options, 'remove')
    
    // return Event for chaining
    return this
  }
	
  /**
   * Subscribe to events
   * @param { Function } listener - function triggered on event
   * @param { Object } options - characteristics about the event listener
   * @param { String } stack - for "add" or "remove" namespaces
   * @return { Object } Event - returns class for chaining
   */
  async subscribe(listener, options = {}, stack = 'add') {
  
  	// assign options to Event
    this.options = {
      capture: options.capture || false,
      once: options.once || false,
      signal: this.controller.signal
    }
    
    // assign listener to Event
    this.listener = listener
    
    // ensure event type(s) are wrapper in array
    const types = !Array.isArray(this.type[stack])
    	? [this.type[stack]]
      : this.type[stack]
      
    // iterate each event type
    for await (const type of types) {
    
    	// assign passive on scroll to Event options
      this.options.passive = options.passive || type === 'scroll'
      
    	 // intilize listener on event type, include options
    	this.target[stack + 'EventListener'](type, this.listener, this.options)
    }
    
    // return Event for chaining
    return this
  }

}

// new event instance with add/remove options
const emit = new Event({
  add: options.attach.types,
  remove: options.detach.types,
})

// emit/init subscription
emit.subscribe(console.log)

