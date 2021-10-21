import options from '/configs.js'
import Iterator from '/iterators.js'
import Helper from '/helpers.js'

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
    	...Iterator.map({
        top, left, width, height
      // convert values to rem
      }, Helper.convertToRem),
      // include default styles
      ...options.requiredStyles,
      // include target styles 
      borderRadius, color
    }
  }
}

export default new Query()
