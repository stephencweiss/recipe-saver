import { Recipe, User } from "@prisma/client";

import { prisma } from "~/db.server";

export async function markRecipeAsCooked(recipeId: Recipe["id"], userId: User["id"]) {
  if (!recipeId || !userId) {
    throw new Error("Cannot mark recipe as cooked if recipeId or userId is missing");
  }

  const existingUserRecipe = await prisma.userRecipe.findUnique({
    where: {
      userId_recipeId: {
        recipeId,
        userId,
      },
    },
  });
  if (existingUserRecipe != null) {
    const updatedRecipe = await prisma.userRecipe.update({
      where: {
        userId_recipeId: {
          recipeId,
          userId,
        },
      },
      data: {
        lastCooked: new Date(),
        cookCount: (existingUserRecipe.cookCount ?? 0) + 1,
        updatedDate: new Date(),
      },
    });
    return updatedRecipe;
  }

  return await prisma.userRecipe.create({
    data: {
      recipeId,
      userId,
      lastCooked: new Date(),
      cookCount: 1,
    },
  });


}

export async function getCookCounts(recipeId: Recipe["id"], userId?: User["id"]) {
  const [userCookCountTemp, totalCookCountTemp] = await Promise.all([
    ...[userId ? getUserRecipeCookCount(recipeId, userId) : []],
    getTotalCookCount(recipeId),
  ]);
  const userCookCount = typeof userCookCountTemp === "number" ? userCookCountTemp : 0;
  const totalCookCount = typeof totalCookCountTemp === "number" ? totalCookCountTemp : 0;
  return { userCookCount, totalCookCount };
}

async function getUserRecipeCookCount(recipeId: Recipe["id"], userId: User["id"]) {
  const userRecipe = await prisma.userRecipe.findUnique({
    where: {
      userId_recipeId: {
        recipeId,
        userId,
      },
    },
  });
  return userRecipe?.cookCount ?? 0;
}

async function getTotalCookCount(recipeId: Recipe["id"]) {
  const userRecipes = await prisma.userRecipe.findMany({
    where: {
      recipeId,
    },
  });
  return userRecipes.reduce((acc, curr) => acc + (curr.cookCount ?? 0), 0);
}