import {
  type User,
  type Comment,
  type Recipe,
  type RecipeIngredient,
  type Tag,

} from "@prisma/client";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";
import { flattenAndAssociateComment, filterPrivateComments } from "~/utils/comment.utils";

import { FlatCommentServer, CommentTypes, CreatableComment, createComment, deleteComment } from "../comments/comment.server";

interface PaginationOptions {
  skip?: number;
  take?: number;
};

type Options = PaginationOptions;

/** A composite entry which combines Recipe Ingredients with Ingredients */
export type CompositeIngredient = Omit<RecipeIngredient, "createdDate">

/** Used for User Inputs where data may be partial */
export type IngredientFormEntry = Partial<CompositeIngredient> & { isDeleted: boolean };

/** Used for creating a new recipe */
export type CreatableRecipe = Omit<Recipe, "id" | "createdDate" | "updatedDate" | "preparationSteps">
  & { ingredients: Omit<IngredientFormEntry, "isDeleted">[] }
  & { preparationSteps: string[] }
  & { tags: Pick<Tag, 'name'>[] }
  & { id?: Recipe["id"] }
  & { userId?: User["id"] }

/** Used for updating an existing recipe */
type UpdatableRecipe = CreatableRecipe
  & { id: Recipe["id"] }
  & { tags: Tag[] }
  & { userId: User["id"] }

export const isUpdatableRecipe = (recipe: CreatableRecipe | UpdatableRecipe): recipe is UpdatableRecipe => {
  if (recipe.id != null && recipe.userId != null) return true;
  return false;
}

export async function getIngredientsForRecipe({ id }: Pick<Recipe, "id">) {
  return await prisma.recipeIngredient.findMany({
    select: {
      recipeId: true,
      name: true,
      quantity: true,
      unit: true,
      note: true,
    },
    where: { recipeId: id },
  });
}

export async function getRecipeDetails({ id }: Pick<Recipe, "id">) {
  return await prisma.recipe.findFirst({
    select: {
      id: true,
      description: true,
      isPrivate: true,
      preparationSteps: true,
      source: true,
      sourceUrl: true,
      submittedBy: true,
      title: true,
      user: true,
    },
    where: { id },
  });
}

export interface RecipeUserArgs extends Pick<Recipe, "id"> { requestingUser?: Partial<Pick<User, "id">> }

export async function getRecipeWithIngredients({ id, requestingUser }: RecipeUserArgs) {
  const recipe = await prisma.recipe.findFirst({
    select: {
      id: true,
      description: true,
      cookTime: true,
      prepTime: true,
      totalTime: true,
      recipeYield: true,
      isPrivate: true,
      preparationSteps: true,
      recipeIngredients: {
        select: {
          id: true,
          name: true,
          note: true,
          quantity: true,
          unit: true,
        },
      },
      recipeTags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      source: true,
      sourceUrl: true,
      submittedBy: true,
      title: true,
      user: true,
    },
    where: { id },

  });
  if (!recipe) return null;
  if (recipe.isPrivate && requestingUser?.id !== recipe.submittedBy) return null;
  return recipe;
}

export interface CreatableRecipeComment extends CreatableComment {
  recipeId: Recipe["id"],

}
export async function createRecipeComment({ recipeId, comment, isPrivate }: CreatableRecipeComment, submittedBy: User["id"]) {
  const createdComment = await createComment({ comment, isPrivate }, submittedBy)

  await prisma.recipeComment.create({
    data: {
      recipeId,
      commentId: createdComment.id,
    },
  });
  return createdComment;
}

export async function deleteRecipeComment(recipeId: Recipe["id"], commentId: Comment["id"], requestingUserId: User["id"]) {
  await deleteComment(commentId, requestingUserId);
  return await prisma.recipeComment.deleteMany({
    where: {
      recipeId,
      commentId,
    },
  });
};

export async function getRecipeComments({ id, requestingUser }: RecipeUserArgs): Promise<FlatCommentServer[]> {
  const recipeComments = await prisma.recipeComment.findMany({
    select: {
      comment: {
        select: {
          comment: true,
          createdDate: true,
          id: true,
          isPrivate: true,
          submittedBy: true,
          updatedDate: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          }
        },
      },
    },
    where: {
      recipeId: id,
    },
  });
  const commentType: CommentTypes = "recipe";
  return recipeComments
    .map(({ comment }) => ({ ...comment }))
    .filter(c => filterPrivateComments(c, requestingUser?.id ?? ""))
    .map((c) => flattenAndAssociateComment(c, { associatedId: id, commentType }))
}

export interface RecipesResponse {
  id: string;
  title: string;
  description: string | null;
  user: {
    id: string;
    name: string | null;
    username: string;
  } | null;
  rating: number,
  tags: {
    id: string;
    name: string;
  }[];
}

/**
 * Gets all recipes which are not private in a paginated format
 */
export async function getRecipes(query: Options): Promise<RecipesResponse[]> {
  const optionsWithDefaults = {
    skip: 0,
    take: 100,
    ...query,
  };

  const recipes = await prisma.recipe.findMany({
    ...optionsWithDefaults,
    where: { isPrivate: false },
    select: {
      id: true,
      title: true,
      description: true,
      recipeTags: { select: { tag: { select: { name: true, id: true } } } },
      recipeRatings: { select: { rating: true } },
      user: { select: { id: true, name: true, username: true } }
    },
    orderBy: { createdDate: "desc" },
  });
  return recipes.map((recipe) => ({
    ...recipe,
    tags: recipe.recipeTags.map((tag) => tag.tag),
    rating: recipe.recipeRatings.reduce((acc, cur) => acc + cur.rating, 0) / recipe.recipeRatings.length,
  }))
}

/**
 * Get recipes which have been submitted by a user
 * Paginated by default to the first 100 recipes
 */
export function getSubmittedRecipes({ userId }: { userId: User["id"] }, options?: Options) {
  const optionsWithDefaults = {
    skip: 0,
    take: 100,
    ...options,
  };

  return prisma.recipe.findMany({
    ...optionsWithDefaults,
    where: { submittedBy: userId },
    select: { id: true, title: true },
    orderBy: { createdDate: "desc" },
  });
}
async function createRecipeIngredient({
  recipeId,
  name,
  quantity,
  unit,
  note,
}: Pick<RecipeIngredient, "recipeId" | "name"> &
  Partial<RecipeIngredient>) {
  return await prisma.recipeIngredient.create({
    data: {
      recipeId,
      name,
      quantity,
      unit,
      note,
    },
  });
}
async function upsertRecipeIngredient({
  recipeId,
  id,
  name,
  quantity,
  unit,
  note,
}: Pick<RecipeIngredient, "id" | "recipeId" | "name"> &
  Partial<RecipeIngredient>) {
  return await prisma.recipeIngredient.upsert({
    where: { id },
    update: { name, quantity, unit, note, updatedDate: new Date() },
    create: {
      quantity,
      name,
      unit,
      note,
      recipe: { connect: { id: recipeId } },
    },
  });
}

async function associateIngredientsWithRecipe(
  recipe: Pick<Recipe, "id">,
  ingredients: Partial<IngredientFormEntry>[],
) {
  return await Promise.all(
    ingredients.map(async (compositeIngredient) => {
      const { id, name, quantity, unit, note } = compositeIngredient;
      invariant(name, "Ingredient name is required");

      if (!id) {
        // Create new ingredient
        return await createRecipeIngredient({
          recipeId: recipe.id,
          name,
          quantity,
          unit,
          note,
        });
      }

      // Associate ingredients with recipe
      const recipeIngredient = await upsertRecipeIngredient({
        recipeId: recipe.id,
        id,
        name,
        quantity,
        unit,
        note,
      });
      return { ingredient: compositeIngredient, recipeIngredient };
    }),
  );
}

async function deleteRecipeIngredients(
  recipe: Pick<Recipe, "id">,
  ingredients: Pick<RecipeIngredient, "id">[],
) {
  const ingredientIds = ingredients.map((ingredient) => ingredient.id);
  return prisma.recipeIngredient.deleteMany({
    where: { recipeId: recipe.id, id: { in: ingredientIds } },
  });
}

export async function disassociateIngredientsFromRecipe(
  recipe: Pick<Recipe, "id">,
  ingredientIds: Pick<RecipeIngredient, "id">[],
) {
  await deleteRecipeIngredients(recipe, ingredientIds);
}

async function upsertTags(tags: Tag[]) {
  return await Promise.all(
    tags.map(async (tag) => {
      return await prisma.tag.upsert({
        where: { id: tag.id },
        update: { name: tag.name },
        create: { name: tag.name },
      });
    }),
  );
}

async function upsertRecipeTags(
  recipeId: Recipe["id"],
  tags: Tag[],
  userId?: User["id"],
) {
  return await Promise.all(
    tags.map(async (tag) => {
      return await prisma.recipeTag.upsert({
        where: { recipeId_tagId: { recipeId, tagId: tag.id } },
        update: {},
        create: { recipeId, addedBy: userId, tagId: tag.id },
      });
    }),
  );
}

async function associateTagsWithRecipe(
  recipe: Pick<Recipe, "id">,
  tags: Tag[],
  userId?: User["id"],
) {
  const updatedTags = await upsertTags(tags);
  return await upsertRecipeTags(recipe.id, updatedTags, userId);
}

async function updateRecipe(
  recipe: Omit<Recipe, "createdDate" | "updatedDate" | "preparationSteps"> & {
    preparationSteps: string[];
  },
) {
  // Defer stringifying until record creation.
  const recipeDetails = {
    ...recipe,
    preparationSteps: JSON.stringify(recipe.preparationSteps),
  };

  return await prisma.recipe.upsert({
    where: { id: recipeDetails.id },
    update: recipeDetails,
    create: { ...recipeDetails },
  });
}

export async function updateRecipeWithDetails({
  id,
  description,
  ingredients,
  isPrivate,
  preparationSteps,
  source,
  sourceUrl,
  submittedBy,
  tags,
  title,
  cookTime,
  prepTime,
  recipeYield,
  totalTime,
  userId,
}: UpdatableRecipe) {

  // Catch the case where the user is trying to update an existing recipe which
  //  doesn't belong to them
  invariant(userId, "User ID is required when upserting a recipe");
  invariant(
    userId === submittedBy,
    "User ID must match submittedBy when upserting a recipe",
  );

  const recipe = await updateRecipe({
    id,
    cookTime,
    prepTime,
    recipeYield,
    totalTime,
    description,
    isPrivate,
    preparationSteps,
    source,
    sourceUrl,
    submittedBy,
    title,
  });
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
  cookTime,
  prepTime,
  totalTime,
  recipeYield,
  description,
  title,
  submittedBy,
  preparationSteps,
  tags,
  ingredients,
  source,
  sourceUrl,
}: CreatableRecipe) {
  // Try to insert tags - get the inserted tags back
  const insertedTags = await Promise.all(
    tags.map(async (t) => {
      const tag = await prisma.tag.findUnique({ where: { name: t.name } });
      if (tag) {
        return tag;
      }
      return await prisma.tag.create({ data: { name: t.name } });
    }),
  );

  // // Add ingredients to global list
  // const insertedIngredients = await Promise.all(
  //   ingredients.map(async ({ name }) => {
  //     const ingredient = await prisma.ingredient.findUnique({
  //       where: { name },
  //     });
  //     if (ingredient) {
  //       return ingredient;
  //     }
  //     if (!name) throw new Error("Ingredient name is required");
  //     return await prisma.ingredient.create({ data: { name } });
  //   }),
  // );

  const recipe = await prisma.recipe.create({
    data: {
      title,
      cookTime,
      prepTime,
      totalTime,
      recipeYield,
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

  await associateIngredientsWithRecipe(recipe, ingredients);
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
