import { type User, type Recipe, type RecipeIngredient, type Tag, type Ingredient } from "@prisma/client";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";
import { asyncFilter } from "~/utils";

/** A composite entry which combines Recipe Ingredients with Ingredients */
export type CompositeIngredient = Omit<RecipeIngredient, 'createdDate'> & Omit<Ingredient, 'createdDate'>;

/** Used for User Inputs where data may be partial */
export type IngredientFormEntry = Partial<CompositeIngredient>

export async function getRecipeDetails({ id, }: Pick<Recipe, "id">) {
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
  const ingredientsDetails = await prisma.recipeIngredient.findMany({ select: { recipeId: true, ingredientId: true, quantity: true, unit: true, note: true }, where: { recipeId: id } })
  const ingredientNames = await prisma.ingredient.findMany({ select: { id: true, name: true }, where: { id: { in: ingredientsDetails.map(ingredient => ingredient.ingredientId) } } })
  const ingredients = ingredientNames.map(iName => ({ ...iName, ...ingredientsDetails.find(ingredient => ingredient.ingredientId === iName.id) }))
  return ingredients;
}

export async function getRecipeWithIngredients({ id }: Pick<Recipe, "id">) {
  const recipeDetails = await getRecipeDetails({ id })
  const fullRecipe = { ...recipeDetails, ingredients: await getIngredientsForRecipe({ id }) }
  return fullRecipe;
}

export function getSubmittedRecipes({ userId }: { userId: User["id"] }) {
  return prisma.recipe.findMany({
    where: { submittedBy: userId },
    select: { id: true, title: true },
    orderBy: { createdDate: "desc" },
  });
}

async function upsertIngredient({ id, name }: Pick<Ingredient, "name"> & Partial<Ingredient>) {
  return await prisma.ingredient.upsert({ where: { id }, update: { name }, create: { name } })
}

async function upsertRecipeIngredient({ recipeId, ingredientId, quantity, unit, note }: Pick<RecipeIngredient, "recipeId" | "ingredientId"> & Partial<RecipeIngredient>) {
  return await prisma.recipeIngredient.upsert({
    where: { recipeId_ingredientId: { recipeId, ingredientId } },
    update: { quantity, unit, note },
    create: { quantity, unit, note, ingredient: { connect: { id: ingredientId } }, recipe: { connect: { id: recipeId } } }
  });
}

async function associateIngredientsWithRecipe(recipe: Pick<Recipe, "id">, ingredients: Partial<CompositeIngredient>[]) {
  return await Promise.all(ingredients.map(async (ingredient) => {
    const { id, name, quantity, unit, note } = ingredient;
    invariant(name, "Ingredient name is required")
    // Add ingredients to global list
    const updatedIngredient = await upsertIngredient({ id, name })
    // Associate ingredients with recipe
    const recipeIngredient = await upsertRecipeIngredient({ recipeId: recipe.id, ingredientId: updatedIngredient.id, quantity, unit, note })
    return { ingredient, recipeIngredient };
  }));
}

async function deleteRecipeIngredients(recipe: Pick<Recipe, "id">, ingredients: Pick<Ingredient, "id">[]) {
  const ingredientIds = ingredients.map(ingredient => (ingredient.id));
  return prisma.recipeIngredient.deleteMany({ where: { recipeId: recipe.id, ingredientId: { in: ingredientIds } } })
}

async function deleteOrphanedIngredients(ingredients: Pick<Ingredient, "id">[]) {
  const ingredientIds = ingredients.map(ingredient => (ingredient.id));
  const orphans = await asyncFilter(
    ingredientIds,
    async (ingredientId: string) =>
      !await prisma.recipeIngredient.findFirst({ where: { ingredientId } })
  )
  return prisma.ingredient.deleteMany({ where: { id: { in: orphans } } })
}

export async function disassociateIngredientsFromRecipe(recipe: Pick<Recipe, "id">, ingredientIds: Pick<Ingredient, "id">[]) {
  await deleteRecipeIngredients(recipe, ingredientIds);
  await deleteOrphanedIngredients(ingredientIds);
}

async function upsertTags(tags: Tag[]) {
  return await Promise.all(
    tags.map(async (tag) => {
      return await prisma.tag.upsert({ where: { id: tag.id }, update: { name: tag.name }, create: { name: tag.name } })
    })
  );
}

async function upsertRecipeTags(recipeId: Recipe["id"], tags: Tag[], userId?: User["id"]) {
  return await Promise.all(
    tags.map(async (tag) => {
      return await prisma.recipeTag.upsert({ where: { recipeId_tagId: { recipeId, tagId: tag.id } }, update: {}, create: { recipeId, addedBy: userId, tagId: tag.id } })
    })
  );
}

async function associateTagsWithRecipe(recipe: Pick<Recipe, "id">, tags: Tag[], userId?: User["id"]) {
  const updatedTags = await upsertTags(tags);
  return await upsertRecipeTags(recipe.id, updatedTags, userId);
}

async function upsertRecipe(recipe: Omit<Recipe, "createdDate" | "updatedDate" | "preparationSteps"> & { preparationSteps: string[] }) {
  // Defer stringifying until record creation.
  const recipeDetails = { ...recipe, preparationSteps: JSON.stringify(recipe.preparationSteps) };

  return await prisma.recipe.upsert({
    where: { id: recipeDetails.id },
    update: recipeDetails,
    create: { ...recipeDetails },
  });
}

export async function upsertRecipeWithDetails({
  id,
  description,
  title,
  preparationSteps,
  source,
  sourceUrl,
  submittedBy,
  tags,
  ingredients,
  userId,
}: Omit<Recipe, "createdDate" | "updatedDate" | "preparationSteps">
  & { preparationSteps: string[] }
  & { userId: User["id"] }
  & { tags: Tag[] }
  & { ingredients: Partial<CompositeIngredient>[] }) {
  invariant(userId, "User ID is required when upserting a recipe")
  invariant(userId === submittedBy, "User ID must match submittedBy when upserting a recipe")
  const recipe = await upsertRecipe({ id, description, title, preparationSteps, source, sourceUrl, submittedBy });
  await associateTagsWithRecipe(recipe, tags, userId);
  await associateIngredientsWithRecipe(recipe, ingredients);
  return recipe;
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
    ingredients: IngredientFormEntry[];
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
