export const isValidString = (str: unknown): str is string => typeof str == 'string' && str.trim().length > 0

/**
 * A simple function to remove text in parentheses from a string.
 * @example "1/2 (and 1.5 here)" --> "1/2"
 * @example "1/2 (and 1.5 here), and 2.5 here" --> "1/2 , and 2.5 here"
 */
export const removeTextInParentheses = (raw: string) => {
  return raw.replace(/\([^)]*\)/g, '');
}

/**
 * A function to remove extra spaces from a string.
 * @example " 1/2  ,  and 2.5 here. " --> "1/2, and 2.5 here."
 */
export const removeExtraSpaces = (raw: string) => {
  // Remove spaces before punctuation
  raw = raw.replace(/\s+([,.!?;:])/, '$1');

  // Remove spaces after punctuation if it's not followed by a letter or number
  raw = raw.replace(/([,.!?;:])\s+(?![a-zA-Z0-9])/, '$1');

  // Replace multiple spaces with a single space
  raw = raw.replace(/\s{2,}/g, ' ');

  return raw.trim();
}