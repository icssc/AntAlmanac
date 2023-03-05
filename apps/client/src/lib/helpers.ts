/**
 * @param courseNumber string that represents the course number of a course (eg. '122A', '121')
 * @returns int or number with a decimal representation of the passed in string (eg. courseNumAsDecimal('122A') returns 122.1, courseNumAsDecimal('121') returns 121)
 */
export function courseNumAsDecimal(courseNumber: string) {
  // I wanted to split the course detail number into letters and digits
  const courseNumArr = courseNumber.split(/(\d+)/)
  // Gets rid of empty strings in courseNumArr
  const filtered = courseNumArr.filter((value) => value !== '')

  // Return 0 if array is empty
  if (filtered.length === 0) {
    console.error(`No characters were found, returning 0, Input: ${courseNumber}`)
    return 0
  }

  const lastElement = filtered[filtered.length - 1].toUpperCase() // .toUpperCase() won't affect numeric characters
  const lastElementCharCode = lastElement.charCodeAt(0) // Just checks the first character of the last element in the array
  // Return the last element of the filtered array as an integer if it represents an integer
  if ('0'.charCodeAt(0) <= lastElementCharCode && lastElementCharCode <= '9'.charCodeAt(0)) {
    return parseInt(lastElement, 10)
  }

  // If the string does not have any numeric characters
  if (filtered.length === 1) {
    console.error(`The string did not have numbers, returning 0, Input: ${courseNumber}`)
    return 0
  }

  // This element is the second to last element of the array, supposedly a string of numeric characters
  const secondToLastElement = filtered[filtered.length - 2]
  // The characters within [A-I] or [a-i] will be converted to 1-9, respectively
  const letterAsNumber = lastElement.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1
  if (letterAsNumber >= 1 && letterAsNumber <= 9) {
    return parseFloat(`${secondToLastElement}.${letterAsNumber}`)
  }
  console.error(
    `The first character type at the end of the string was not within [A-I] or [a-i], returning last numbers found in string, Violating Character: ${
      filtered[filtered.length - 1][0]
    }, Input: ${courseNumber}`
  )
  // This will represent an integer at this point because the split in the beginning split the array into strings of digits and strings of other characters
  // If the last element in the array does not represent an integer, then the second to last element must represent an integer
  return parseInt(secondToLastElement, 10)
}

/**
 * dummy export to pass eslint: TODO remove when other exports are added
 */
export type Helper = unknown
