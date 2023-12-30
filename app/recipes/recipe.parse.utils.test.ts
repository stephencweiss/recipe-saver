import { _testing, parseIngredientsList } from "./recipe.parse.utils";
const { parseIngredientQuantity, parseIngredientNotes, parseIngredientUnit, parseIngredientComponents } = _testing;
describe("RecipeParseUtils", () => {

  describe("parseIngredientQuantity", () => {
    const testCases = [
      { raw: "1", quantity: "1" },
      { raw: "1/2", quantity: "1/2" },
      { raw: "1 1/2", quantity: "1 1/2" },
      { raw: "1 1/2 to 2 1/2", quantity: "1 1/2 to 2 1/2" },
      { raw: "1/2 - 3/4", quantity: "1/2 - 3/4" },
      { raw: "1/2 to 3/4", quantity: "1/2 to 3/4" },
      { raw: "2 - 3 and then other words", quantity: "2 - 3" },
      { raw: "2 to 3 and then other words", quantity: "2 to 3" },
      { raw: "1/2 (and 1.5 here)", quantity: "1/2" },
    ]
    testCases.forEach(({ raw, quantity }) => {
      it(`parses ${raw}`, () => {
        const parsed = parseIngredientQuantity(raw)
        expect(parsed).toEqual(quantity);
      });
    })
    const unhandledCases = [
      // We do not currently match fractions to integers
      // We only support integers to integers and fractions to fractions
      { raw: "1 to 2.5", quantity: "1 to 2.5", expect: "1 to 2" },
      { raw: "1 1/2 to 2", quantity: "1 1/2 to 2", expect: "1 1/2" },
      { raw: "1 1/2 - 2", quantity: "1 1/2 - 2", expect: "1 1/2" },
    ]
    unhandledCases.forEach(({ raw, quantity, expect: expected }) => {
      it(`does not correctly parse ${raw}`, () => {
        const parsed = parseIngredientQuantity(raw)
        expect(parsed).toEqual(expected);
        expect(parsed).not.toEqual(quantity);
      });
    })
  })

  describe("parseIngredientnote", () => {
    const testCases = [
      { raw: "1/2 (and 1.5 here)", note: "and 1.5 here" },
      { raw: "1/2 (and 1.5 here, and 2.5 here)", note: "and 1.5 here, and 2.5 here" },
      { raw: "1/2 (and 1.5 here), and 2.5 here, (3.5 here), and 4.5 here)", note: "and 1.5 here; 3.5 here" },
    ]
    testCases.forEach(({ raw, note }) => {
      it(`parses ${raw}`, () => {
        const parsed = parseIngredientNotes(raw)
        expect(parsed).toEqual(note);
      });
    })
  })

  describe("parseIngredientUnit", () => {
    const testCases = [
      { raw: "3 tablespoons neutral oil, such as sunflower or canola", unit: "tablespoons", },
      { raw: "1 large onion, chopped", unit: "whole", },
      { raw: "2 jalapeños, seeded or not, thinly sliced", unit: "whole", },
      { raw: "1 bay leaf", unit: "whole", },
      { raw: "1 knob ginger (about 1 inch), minced", unit: "knob", },
      { raw: "4 garlic cloves, minced", unit: "cloves", },
      { raw: "1 1/2 teaspoons garam masala", unit: "teaspoons", },
      { raw: "1 teaspoon ground cumin", unit: "teaspoon", },
      { raw: "1/2 teaspoon ground turmeric", unit: "teaspoon", },
      { raw: "2 (15-ounce) cans chickpeas, rinsed", unit: "cans", },
      { raw: "1 (13.5-ounce) can coconut milk (do not use light coconut milk)", unit: "can", },
      { raw: "1 (13.5-ounce) can pumpkin purée", unit: "can", },
      { raw: "1 1/2 teaspoons fine sea salt, more as needed", unit: "teaspoons", },
      { raw: "3/4 cup chopped cilantro, more for serving", unit: "cup", },
      { raw: "2 to 3 tablespoons fresh lime juice, plus wedges for serving", unit: "tablespoons", },
      { raw: "Cooked rice or couscous, for serving (optional)", unit: "whole", },
    ]
    testCases.forEach(({ raw, unit }) => {
      it(`parses ${raw}`, () => {
        const parsed = parseIngredientUnit(raw)
        expect(parsed).toEqual(unit);
      });
    })
  })



  describe("parseIngredients", () => {
    const testCases = [
      {
        raw: "3 tablespoons neutral oil, such as sunflower or canola",
        ingredient: "neutral oil, such as sunflower or canola"
      },
      {
        raw: "1 large onion, chopped",
        ingredient: "large onion, chopped"
      },
      {
        raw: "2 jalapeños, seeded or not, thinly sliced",
        ingredient: "jalapeños, seeded or not, thinly sliced"
      },
      {
        raw: "1 bay leaf",
        ingredient: "bay leaf"
      },
      {
        raw: "1 knob ginger (about 1 inch), minced",
        ingredient: "ginger, minced",
      },
      {
        raw: "4 garlic cloves, minced",
        ingredient: "garlic, minced"
      },
      {
        raw: "1 1/2 teaspoons garam masala",
        ingredient: "garam masala"
      },
      {
        raw: "1 teaspoon ground cumin",
        ingredient: "ground cumin"

      },
      {
        raw: "1/2 teaspoon ground turmeric",
        ingredient: "ground turmeric"

      },
      {
        raw: "2 (15-ounce) cans chickpeas, rinsed",
        ingredient: "chickpeas, rinsed",
      },
      {
        raw: "1 (13.5-ounce) can coconut milk (do not use light coconut milk)",
        ingredient: "coconut milk",
      },
      {
        raw: "1 (13.5-ounce) can pumpkin purée",
        ingredient: "pumpkin purée",
      },
      {
        raw: "1 1/2 teaspoons fine sea salt, more as needed",
        ingredient: "fine sea salt, more as needed",
      },
      {
        raw: "3/4 cup chopped cilantro, more for serving",
        ingredient: "chopped cilantro, more for serving",
      },
      {
        raw: "Cooked rice or couscous, for serving (optional)",
        ingredient: "cooked rice or couscous, for serving",

      },
      {
        raw: "2 to 3 tablespoons fresh lime juice, plus wedges for serving",
        ingredient: "fresh lime juice, plus wedges for serving",

      },
    ]

    testCases.forEach(({ raw, ingredient, }) => {
      it(`parses ${raw}`, () => {
        const { name } = parseIngredientComponents(raw);
        expect(name).toEqual(ingredient);

      });
    })
  })

  describe("parseIngredientsList", () => {
    const ingredientsList = [
      {
        name: "3 tablespoons neutral oil, such as sunflower or canola",
        ingredient: "neutral oil, such as sunflower or canola",
        unit: "tablespoons",
        quantity: "3",
        note: "",
      },
      {
        name: "1 large onion, chopped",
        ingredient: "large onion, chopped",
        unit: "whole",
        quantity: "1",
        note: "",
      },
      {
        name: "2 jalapeños, seeded or not, thinly sliced",
        ingredient: "jalapeños, seeded or not, thinly sliced",
        unit: "whole",
        quantity: "2",
        note: "",
      },
      {
        name: "1 bay leaf",
        ingredient: "bay leaf",
        unit: "whole",
        quantity: "1",
        note: "",
      },
      {
        name: "1 knob ginger (about 1 inch), minced",
        ingredient: "ginger, minced",
        unit: "knob",
        quantity: "1",
        note: "about 1 inch",
      },
      {
        name: "4 garlic cloves, minced",
        ingredient: "garlic, minced",
        unit: "cloves",
        quantity: "4",
        note: "",
      },
      {
        name: "1 1/2 teaspoons garam masala",
        ingredient: "garam masala",
        unit: "teaspoons",
        quantity: "1 1/2",
        note: "",
      },
      {
        name: "1 teaspoon ground cumin",
        ingredient: "ground cumin",
        unit: "teaspoon",
        quantity: "1",
        note: "",
      },
      {
        name: "1/2 teaspoon ground turmeric",
        ingredient: "ground turmeric",
        unit: "teaspoon",
        quantity: "1/2",
        note: "",
      },
      {
        name: "2 (15-ounce) cans chickpeas, rinsed",
        ingredient: "chickpeas, rinsed",
        unit: "cans",
        quantity: "2",
        note: "15-ounce"
      },
      {
        name: "1 (13.5-ounce) can coconut milk (do not use light coconut milk)",
        ingredient: "coconut milk",
        unit: "can",
        quantity: "1",
        note: "13.5-ounce; do not use light coconut milk"
      },
      {
        name: "1 (13.5-ounce) can pumpkin purée",
        ingredient: "pumpkin purée",
        unit: "can",
        quantity: "1",
        note: "13.5-ounce"
      },
      {
        name: "1 1/2 teaspoons fine sea salt, more as needed",
        ingredient: "fine sea salt, more as needed",
        unit: "teaspoons",
        quantity: "1 1/2",
        note: "",
      },
      {
        name: "3/4 cup chopped cilantro, more for serving",
        ingredient: "chopped cilantro, more for serving",
        unit: "cup",
        quantity: "3/4",
        note: "",
      },
      {
        name: "Cooked rice or couscous, for serving (optional)",
        ingredient: "cooked rice or couscous, for serving",
        unit: "whole",
        quantity: "",
        note: "optional"
      },
      {
        name: "2 to 3 tablespoons fresh lime juice, plus wedges for serving",
        ingredient: "fresh lime juice, plus wedges for serving",
        unit: "tablespoons",
        quantity: "2 to 3",
        note: "",
      },
    ]
    const parsedList = parseIngredientsList(ingredientsList);
    parsedList.forEach((parsedIngredient, i) => {
      it(`parsed ${ingredientsList[i].name}`, () => {
        expect(parsedIngredient.name).toEqual(ingredientsList[i].ingredient);
        expect(parsedIngredient.unit).toEqual(ingredientsList[i].unit);
        expect(parsedIngredient.quantity).toEqual(ingredientsList[i].quantity);
        expect(parsedIngredient.note).toEqual(ingredientsList[i].note);
      })
    })

  })
})