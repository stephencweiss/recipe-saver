import { CreatableRecipe } from "./recipe.server";

/** The function used to parse recipes from different sites */
export async function parseRecipeSite(url: string): Promise<Omit<CreatableRecipe, 'submittedBy'>> {
  if (testUrl(url, 'cooking.nytimes.com')) {
    return parseNYTCooking(url);
  }
  throw Error('Unsupported domain');
}

/** The parser for NYTimes cooking */
async function parseNYTCooking(url: string) {
  const res = await fetch(url);
  const html = await res.text();

  // Finding the script tag with type="application/ld+json"
  // This is where NYTimes keeps all of the recipe data.
  const regex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
  let jsonData = null;

  let match;
  while ((match = regex.exec(html)) !== null) {
    const parsed = JSON.parse(match[1]);
    // Validate that the parsed data is a recipe
    if (parsed['@type'] === 'Recipe') {
      jsonData = parsed;
      break;
    }
  }

  const tagSet = new Set<string>();
  (jsonData.keywords?.split(',') ?? []).forEach((tag: string) => tagSet.add(tag.trim()));
  (jsonData.cuisine?.split(',') ?? []).forEach((tag: string) => tagSet.add(tag.trim()));
  (jsonData.recipeCategory?.split(',') ?? []).forEach((tag: string) => tagSet.add(tag.trim()));
  const tags = [...tagSet]?.map(t => ({ name: t }));

  // Ideally, this would be better and we'd parse the ingredients into our own
  // format of name, quantity, unit, notes, etc.
  // For now, we'll just do this and allow the user to edit later.
  const ingredients = parseIngredients(jsonData.recipeIngredient?.map((ingredient: string) => ({ name: ingredient })) ?? []);

  const preparationSteps = jsonData.recipeInstructions?.map((step: { '@type': 'HowToStep', text: string }) => {
    if (step["@type"] != 'HowToStep') {
      console.log('NYT Cooking recipeInstructions is not of type HowToStep', step)
    }
    return step.text
  }).filter((step: string) => step != null);


  console.log(jsonData);
  const creatableRecipe: Omit<CreatableRecipe, 'submittedBy'> = {
    cookTime: jsonData.cookTime,
    prepTime: jsonData.prepTime,
    totalTime: jsonData.totalTime,
    recipeYield: jsonData.recipeYield,
    title: jsonData.name,
    description: jsonData.description,
    ingredients,
    isPrivate: false, // TODO: Make dynamic
    preparationSteps,
    source: 'NYT Cooking',
    sourceUrl: url,
    tags,
  }
  return creatableRecipe;

}

/** Given a url and a domain, tests to see if the domain is in the url */
function testUrl(url: string, domain: string) {
  const u = new URL(url);
  // The domain is a regex, so we need to escape the periods, since a `.` in a regex means "any character"
  // eslint-disable-next-line no-useless-escape
  const simpleDomain = domain.replace(/\./g, '\.');

  const pattern = new RegExp(simpleDomain, 'i');
  return pattern.test(u.hostname);
}

/**
 * Given a string ingredient, try to find the number in the string, then attempt
 * to pull out the unit.
 */
function extractQuantityUnit(ingredient: string) {
  let quantity = "";
  let unit = "";
  const parts = (ingredient ?? '').split(" ");
  for (let i = 0; i < parts.length; i++) {
    if (!isNaN(parseInt(parts[i].replace('/', ''))) || !isNaN(parseFloat(parts[i]))) {
      quantity = parts[i];
      if (i + 1 < parts.length) {
        unit = parts[i + 1];
      } else {
        unit = 'whole'
      }
      break;
    }
  }
  return [quantity, unit];
}

function parseIngredients(ingredientList: { name: string }[]) {
  const parsedIngredients = [];

  for (const ingredient of ingredientList) {
    const [quantity, unit] = extractQuantityUnit(ingredient.name);
    const nameParts = ingredient.name.split(",")[0].split(" ");

    const name = nameParts.filter(part => part.replace('/', '') && isNaN(parseFloat(part))).join(" ");
    const notes = ingredient.name.replace(name, "").replace(quantity, "").replace(unit, "").replace(", ", "").trim();

    const cleanedName = name.replace(quantity, "").replace(unit, "").trim()
    const parsedIngredient = {
      name: cleanedName,
      notes: notes,
      unit: unit.trim(),
      quantity: quantity.trim()
    };
    parsedIngredients.push(parsedIngredient);
  }

  return parsedIngredients;
};
