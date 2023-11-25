import type { User, Recipe, RecipeIngredient } from "@prisma/client";

import { prisma } from "~/db.server";

export type IngredientEntry = Partial<(Pick<RecipeIngredient, "quantity" | "unit" | "note">
& { name: string; })>

export async function getRecipeDetails({  id,}: Pick<Recipe, "id">) {
  return await prisma.recipe.findFirst({
    select: {
      id: true,
      description: true,
      preparationSteps: true,
      source: true,
      sourceUrl: true,
      title: true,
      submittedBy: true,
      user: true,
    },
    where: { id },
  });
}

export async function getIngredientsForRecipe({ id }: Pick<Recipe, "id">) {
  const ingredientsDetails = await prisma.recipeIngredient.findMany({select: {recipeId: true, ingredientId: true, quantity: true, unit: true, note: true}, where: {recipeId: id}})
  const ingredientNames = await prisma.ingredient.findMany({select: {id:true, name: true}, where: {id: {in: ingredientsDetails.map(ingredient => ingredient.ingredientId)}}})
  const ingredients = ingredientNames.map(iName => ({...iName, ...ingredientsDetails.find(ingredient => ingredient.ingredientId === iName.id)}))
  return ingredients;
}

export async function getRecipeWithIngredients({ id }: Pick<Recipe, "id">) {
  const recipeDetails = await getRecipeDetails({id})
  const fullRecipe = {...recipeDetails, ingredients: await getIngredientsForRecipe({id})}
  return fullRecipe;
}

export function getSubmittedRecipes({ userId }: { userId: User["id"] }) {
  return prisma.recipe.findMany({
    where: { submittedBy: userId },
    select: { id: true, title: true },
    orderBy: { createdDate: "desc" },
  });
}


/**
 * TODO: need to figure out how we want to handle a few things:
 * 1. JSON vs. string for preparationSteps - do we receive the data as JSON and stringify it or require the caller to pass a string?
 * 2. This should probably be decomposed a bit.
 */
export async function createRecipe({
  description,
  title,
  submittedBy,
  preparationSteps,
  tags,
  ingredients,
  source,
  sourceUrl
}: Omit<Recipe, "id" | "createdDate" | "updatedDate" | "preparationSteps">
  & { tags: string[] }
  & { preparationSteps: string[] }
  & {
    ingredients: IngredientEntry[];
  }) {
  // Try to insert tags - get the inserted tags back
  const insertedTags = await Promise.all(
    tags.map(async (name) => {
      const tag = await prisma.tag.findUnique({ where: { name } });
      if (tag) {
        return tag;
      }
      return await prisma.tag.create({ data: { name } });
    }),
  );

  // Add ingredients to global list
  const insertedIngredients = await Promise.all(
    ingredients.map(async ({ name }) => {
      const ingredient = await prisma.ingredient.findUnique({
        where: { name },
      });
      if (ingredient) {
        return ingredient;
      }
      if (!name) throw new Error("Ingredient name is required");
      return await prisma.ingredient.create({ data: { name } });
    }),
  );

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      // Defer stringifying until record creation.
      preparationSteps: JSON.stringify(preparationSteps),
      source,
      sourceUrl,
      submittedBy,
    },
  });

  // Associate the recipe with the tags
  await Promise.all(
    insertedTags.map((tag) => {
      return prisma.recipeTag.create({
        data: {
          recipeId: recipe.id,
          tagId: tag.id,
        },
      });
    }),
  );

  await Promise.all(
    insertedIngredients.map((ingredient) => {
      const ingredientObj = ingredients.find(
        (obj) => obj.name === ingredient.name,
      );
      return prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: ingredientObj?.quantity ?? null,
          unit: ingredientObj?.unit ?? null,
          note: ingredientObj?.note ?? null,
        },
      });
    }),
  );

  return recipe;
}

export function deleteRecipe({
  id,
  userId,
}: Pick<Recipe, "id"> & { userId: User["id"] }) {
  return prisma.recipe.deleteMany({
    where: { id, submittedBy: userId },
  });
}
