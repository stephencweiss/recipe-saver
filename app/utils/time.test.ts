import { _testing } from "./time";

const { parseISO8601Duration } = _testing;
describe("parseISO8601Duration", () => {
  const emptyTime = {
    years: null,
    months: null,
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
  };
  test("parseISO8601Duration handles null", () => {
    expect(parseISO8601Duration(null)).toEqual(emptyTime)
  })
  test("parseISO8601Duration handles empty strings", () => {
    expect(parseISO8601Duration("")).toEqual(emptyTime)
  })
  test("parseISO8601Duration handles null strings", () => {
    expect(parseISO8601Duration("null")).toEqual(emptyTime)
  })
  test("parseISO8601Duration handles well formed 8601Duration strings", () => {
    expect(parseISO8601Duration("PT1H30M")).toEqual({
      days: 0,
      hours: 1,
      minutes: 30,
      months: 0,
      seconds: 0,
      years: 0,
    })
  })
  test("parseISO8601Duration throws on malformed 8601Duration strings", () => {
    expect(() => parseISO8601Duration("PT1h30m")).toThrow("Invalid ISO8601 Duration")
  })
});