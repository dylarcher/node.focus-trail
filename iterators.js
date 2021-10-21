import Helper from '/helpers.js'

class Iterator {
  map(obj, fn) {
  	let head, tail
    // when object
  	if (Helper.isObject(obj)) {
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
  	if (Helper.isObject(obj)) {
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
  	if (Helper.isObject(obj)) {
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

export default new Iterator()
