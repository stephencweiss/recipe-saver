import { RecipeIngredient } from "@prisma/client";

import { removeExtraSpaces, removeTextInParentheses } from "~/utils/strings";

const COOKING_UNITS = new Set([
  'can', 'clove', 'cup', 'cup ', 'fl oz', 'fluid ounce', 'gal', 'gallon', 'knob', 'lb', 'ounce', 'oz', 'pint ', 'pound', 'pt', 'qt', 'quart', 'tablespoon', 'tablespoon', 'tb', 'tbsp', 'tbsp', 'teaspoon', 'teaspoon', 'tsp', 'tsp', 'whole'
]);

/** Takes a list of ingredients which at least have a name property and return the pieces */
export function parseIngredientsList(ingredientList: { name: string; }[]): Pick<RecipeIngredient, "name" | "note" | "quantity" | "rawIngredient" | "unit">[] {
  const parsedIngredients = [];
  for (const ingredient of ingredientList) {
    const parsedIngredient = parseIngredientComponents(ingredient.name);
    parsedIngredients.push({ ...parsedIngredient, rawIngredient: ingredient.name });
  }
  return parsedIngredients;
};

function parseIngredientComponents(raw: string): Pick<RecipeIngredient, "name" | "note" | "quantity" | "unit"> {
  const quantity = parseIngredientQuantity(raw);
  const unit = parseIngredientUnit(raw);
  const note = parseIngredientNotes(raw);

  // Removes notes and the parentheses around them.
  const strippedParensFromRaw = removeTextInParentheses(raw.toLowerCase());

  // Removes the quantity and unit from the raw string and also removes extra spaces
  const ingredientName = removeExtraSpaces(strippedParensFromRaw.replace(quantity, "").replace(unit, ""));

  return { quantity, unit, name: ingredientName, note };
}

/**
 * Explaining the Quantity Pattern (gpt-4):
 *
 * **Fraction Matcher:**
 * Matches a single fraction like 1/2.
 * \b\d+\/\d+\b
 * \b is a word boundary, \d+ matches one or more digits, \/ matches the slash, and \d+ matches one or more digits after the slash.
 *
 * **Fraction Range Matcher:**
 * Matches a range of fractions like 1/2 - 3/4 or 1/2 to 3/4.
 * (?:\s*-\s*\d+\/\d+|\s*to\s*\d+\/\d+)?
 * A non-capturing group (?: ... ) that optionally matches a hyphen or to followed by another fraction, allowing spaces around the hyphen or to.
 *
 * **Whole Number Matcher:**
 * Matches a single whole number like 2.
 * \b\d+\b
 * Similar to the fraction matcher but without the slash and second set of digits.
 *
 * **Whole Number Range Matcher:**
 * Matches a range of whole numbers like 2 - 3 or 2 to 3.
 * (?:\s*-\s*\d+|\s*to\s*\d+)?
 * Similar to the fraction range matcher but matches whole numbers instead of fractions.
 *
 * **Flags:**
 * /g: The global flag, meaning the pattern will be tested against all possible matches in the string, not just the first one.
 *
 * @example "1" --> "1"
 * @example "1/2" --> "1/2"
 * @example "1/2 - 3/4" --> "1/2 - 3/4"
 * @example "1/2 to 3/4" --> "1/2 to 3/4"
 * @example "1/2 (and 1.5 here)" --> "1/2"
 * @example "2 to 3" --> "2 to 3"
 * @example "1 1/2" --> "1 1/2"
 */
function parseIngredientQuantity(raw: string): string {
  const combinedWholeFractionMatcher = '\\b\\d+ \\d+\\/\\d+\\b';
  const combinedWholeFractionRangeMatcher = '(?:\\s*-\\s*\\d+ \\d+\\/\\d+|\\s*to\\s*\\d+ \\d+\\/\\d+)?';
  const fractionMatcher = '\\b\\d+\\/\\d+\\b';
  const fractionRangeMatcher = '(?:\\s*-\\s*\\d+\\/\\d+|\\s*to\\s*\\d+\\/\\d+)?';
  const wholeNumberMatcher = '\\b\\d+\\b';
  const wholeNumberRangeMatcher = '(?:\\s*-\\s*\\d+|\\s*to\\s*\\d+)?';

  const quantityPattern = new RegExp(
    `${combinedWholeFractionMatcher}${combinedWholeFractionRangeMatcher}|${fractionMatcher}${fractionRangeMatcher}|${wholeNumberMatcher}${wholeNumberRangeMatcher}`,
    'g'
  );

  const strippedParensFromRaw = removeTextInParentheses(raw.toLowerCase());

  const match = RegExp(quantityPattern).exec(strippedParensFromRaw);
  return match ? match.join(' ') : "";
}

/**
 * Explaining the Notes Pattern (gpt-4):
 * \( and \) match the opening and closing parentheses.
 * ([^)]+) captures the content inside the parentheses. It matches any character except a closing parenthesis ), one or more times.
 * The g flag is used to find all matches in the string.
 * @example "1/2 (and 1.5 here)" --> "and 1.5 here"
 * @example "1/2 (and 1.5 here, and 2.5 here)" --> "and 1.5 here, and 2.5 here"
 * @example "1/2 (and 1.5 here), and 2.5 here, (3.5 here), and 4.5 here)" --> "and 1.5 here; 3.5 here"
 */
function parseIngredientNotes(raw: string): string {
  const regex = /\(([^)]+)\)/g;
  let match;
  const notes = [];

  while ((match = regex.exec(raw)) !== null) {
    notes.push(match[1].trim());
  }

  return notes.join('; ');
}

/**
 * The parseIngredientUnit function is actually more straight forward.
 * We take the raw string, convert it to lowercase, and remove any text in parentheses.
 * Then we use a regular expression to match the unit, and return the first match.
 * If there is no match, we return the string "whole".
 * @example "3 tablespoons neutral oil, such as sunflower or canola" --> "tablespoons"
 * @example "1 large onion, chopped" --> "whole"
 * @example "2 jalapeños, seeded or not, thinly sliced" --> "whole"
 */
function parseIngredientUnit(raw: string): string {
  // The text in parentheses are often notes, so we remove them.
  const strippedParensFromRaw = removeTextInParentheses(raw.toLowerCase());

  const unitPatternInput = [...COOKING_UNITS.values()].map(unit => `${unit}s?`).join('|')
  const unitPattern = new RegExp(`\\b(${unitPatternInput})\\b`, 'i');

  const unitMatch = RegExp(unitPattern).exec(strippedParensFromRaw);
  const unit = unitMatch ? unitMatch[1] : "whole";
  return unit;
}

export const _testing = {
  parseIngredientQuantity,
  parseIngredientComponents,
  parseIngredientNotes,
  parseIngredientUnit,
  parseIngredientsList,
}