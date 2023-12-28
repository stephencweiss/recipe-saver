import { isValidString } from "./strings";

describe ("isValidString", () => {
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