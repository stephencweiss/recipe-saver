import type { User, Recipe, RecipeIngredient } from "@prisma/client";

import { prisma } from "~/db.server";

export type IngredientEntry = Partial<(Pick<RecipeIngredient, "quantity" | "unit" | "note">
& { name: string; })>



export function getRecipe({
  id,
  userId,
}: Pick<Recipe, "id"> & {
  userId: User["id"];
}) {
  return prisma.recipe.findFirst({
    select: { id: true, description: true, title: true, preparationSteps: true, submittedBy: true, user: true },
    where: { id, submittedBy: userId },
  });
}

// TODO: This is not yet working - need to tie ingredients to recipe with their name.
export async function getRecipeWithIngredients({ id }: Pick<Recipe, "id">) {
  console.log({id})
  const ingredients = await prisma.recipeIngredient.findMany({select: {recipeId: true, ingredientId: true, quantity: true, unit: true, note: true}, where: {recipeId: id}})
  const ingredientNames = await prisma.ingredient.findMany({select: {id:true, name: true}, where: {id: {in: ingredients.map(ingredient => ingredient.ingredientId)}}})
// TODO: tie ingredients to recipe with their name.
  // console.log({ingredients});
  console.log({ingredients, ingredientNames});
  const recipes = await prisma.recipe.findFirst({
    select: {
      id: true,
      description: true,
      title: true,
      preparationSteps: true,
      submittedBy: true,
      user: true,
    },
    where: { id },
  });

  return recipes;
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
      return await prisma.ingredient.create({ data: { name } });
    }),
  );

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      // Defer stringifying until record creation.
      preparationSteps: JSON.stringify(preparationSteps),
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
