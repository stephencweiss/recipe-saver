import { isValidString, removeExtraSpaces, removeTextInParentheses } from "./strings";

describe("isValidString", () => {
  test("isValidString returns false for null", () => {
    const nullValue = null as unknown as string;
    expect(isValidString(nullValue)).toBe(false)
  })
  test("isValidString returns false for empty strings", () => {
    expect(isValidString("")).toBe(false)
  })
  test("isValidString returns true for null strings", () => {
    expect(isValidString("null")).toBe(true)
  })
  test("isValidString returns true for non-empty strings", () => {
    expect(isValidString("hello")).toBe(true)
  })
  test("isValidString returns false for whitespace strings", () => {
    expect(isValidString(" ")).toBe(false)
  })
})

describe("removeTextInParentheses", () => {
  test("removeTextInParentheses removes parenthesis and inside text", () => {
    const text = '1/2 (and 1.5 here)'
    expect(removeTextInParentheses(text)).toBe('1/2 ')
  })
})

describe("removeExtraSpaces", () => {
  test("removeExtraSpaces removes spaces before punctuation", () => {
    const text = ' 1/2  ,  and 2.5 here. '
    expect(removeExtraSpaces(text)).toBe('1/2, and 2.5 here.')
  }
  )
})