import options from '/configs.js'
import Query from '/query.js'

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
      // ensure activeElement is a focusable node
      const match = Query
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
      	// if user input area, wrap parentNode
        return formField ? Object.assign(flowStyle, {
        	// get active node
          ...Query.activeNodeState(target
        	  // get active node parent
            .closest(options.form.fieldWrapper)
          // get active node parent color
          ), color: getComputedStyle(target).color
        // if not user input area, only interactable, wrap activeNode
        }) : Object.assign(flowStyle, Query.activeNodeState())
      }
    }
  }
}

export default new FocusFlow
