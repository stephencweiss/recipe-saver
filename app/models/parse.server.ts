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
  const ingredients = jsonData.recipeIngredient?.map((ingredient: string) => ({ name: ingredient })) ?? [];

  const preparationSteps = jsonData.recipeInstructions?.map((step: { '@type': 'HowToStep', text: string }) => {
    if (step["@type"] != 'HowToStep') {
      console.log('NYT Cooking recipeInstructions is not of type HowToStep', step)
    }
    return step.text
  }).filter((step: string) => step != null);

  console.log({ preparationSteps })

  const creatableRecipe: Omit<CreatableRecipe, 'submittedBy'> = {
    title: jsonData.name,
    preparationSteps,
    ingredients,
    description: jsonData.description,
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