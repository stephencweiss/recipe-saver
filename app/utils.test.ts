import { asyncFilter, asyncMap, extractGenericDataFromFormData, validateEmail } from "./utils";

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail("")).toBe(false);
  expect(validateEmail("not-an-email")).toBe(false);
  expect(validateEmail("n@")).toBe(false);
});

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true);
});


describe("asyncFilter", () => {
  test("async filter returns empty array when no items match", async () => {
    const result = await asyncFilter([1, 2, 3], async (item) => item > 3);
    expect(result).toEqual([]);
  })
  test("async filter returns all items when all items match", async () => {
    const result = await asyncFilter([1, 2, 3], async (item) => item < 4);
    expect(result).toEqual([1, 2, 3]);
  })
  test("async filter really works with async functions", async () => {
    const arr = [1, 2, 3, 4, 5];
    const promised = async (i: number) => i % 2 === 0;
    const result = await asyncFilter(arr, promised);
    expect(result).toEqual([2, 4])
  })
})

describe("asyncMap", () => {
  test("async map transforms a list", async () => {
    const arr = [1, 2, 3, 4, 5];
    const promised = async (i: number) => i * 2;
    const result = await asyncMap(arr, promised);
    expect(result).toEqual([2, 4, 6, 8, 10])
  })
})

describe("extractGenericDataFromFormData", () => {
  test("returns an array with key and value when pattern matches", () => {
    const formData = new FormData();
    const prefix = "inputName"
    formData.append(`${prefix}[1][id]`, "val-1");
    formData.append(`${prefix}[2][id]`, "val-2");
    const pattern = /inputName\[(\d+)\]\[(\w+)\]/;
    const result = extractGenericDataFromFormData(formData, prefix , pattern);
    console.log({pattern, prefix, result});
    expect(result).toEqual([{id: "val-1"}, {id: "val-2"}]);
  });
});