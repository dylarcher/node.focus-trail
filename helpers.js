
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

export default new Helper()
