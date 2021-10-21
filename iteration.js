class Iterate {

  mapArr([head, ...tail], fn) {
  	return !head && !tail.length ? [] : [
      ...this.mapArr(tail, fn),
    	fn(head)
    ]
  }
  
  mapObj(obj, fn) {
    const head = Object.keys(obj)[0]
  	const { [head]: value, ...tail } = obj
    return !head && !Object
      .values(tail)
      .length ? {} : {
      ...this.mapObj(tail, fn),
      [head]: fn(value, head)
    }
  }
  
  filterArr([head, ...tail], fn) {
    return !head ? [] : fn(head)
      ? [head, ...this.filterArr(tail, fn)]
      : [...this.filterArr(tail, fn)]
  }
  
  filterObj(obj, fn) {
    const head = Object.keys(obj)[0]
  	const { [head]: value, ...tail } = obj
    return !head ? {} : fn(value, head)
    	? { [head]: value, ...this.filterObj(tail, fn) }
      : { ...this.filterObj(tail, fn) }
  }
  
  reduceArr([head, ...tail], fn, acc = 0) {
  	return !head ? acc : this.reduceArr(tail, fn, fn(acc, head))
  }
  
  reduceObj(obj, fn, acc = {}) {
    const head = Object.keys(obj)[0]
  	const { [head]: value, ...tail } = obj
    return !head ? acc : this.reduceObj(tail, fn, fn(acc, value, head))
  }

}

export default new Iterate()
