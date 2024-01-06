import {
  type Collection,
  type Recipe,
  type User,
} from "@prisma/client";

import { prisma } from "~/db.server";

import { createCollection, getCollectionAccess, getDefaultCollectionId } from "./collection.server";

export async function addRecipeToDefaultCollection(recipeId: Recipe["id"], requestingUserId: User["id"]) {
  let collectionId = await getDefaultCollectionId(requestingUserId);
  if (!collectionId) {
    const collection = await createCollection({
      name: "My Recipes",
      isDefault: true,
      isPrivate: false,
      userId: requestingUserId,
    })
    collectionId = collection.id;
  }
  return addRecipeToCollection(recipeId, collectionId, requestingUserId);
}

export async function addRecipeToCollection(recipeId: Recipe["id"], collectionId: Collection["id"], requestingUserId: User["id"]) {
  const userAccess = await getCollectionAccess(collectionId, requestingUserId);
  if (!userAccess || userAccess.accessLevel === 'read') {
    throw new Response("You are not authorized to edit this collection", { status: 401 });
  }
  const recipeCollection = await prisma.userRecipeCollection.create({
    data: {
      recipeId,
      collectionId,
      userId: requestingUserId,
    }
  });

  return recipeCollection;
}

export async function removeRecipeFromCollection(recipeId: Recipe["id"], collectionId: Collection["id"], requestingUserId: User["id"]) {

  const userAccess = await getCollectionAccess(collectionId, requestingUserId);
  if (!userAccess || userAccess.accessLevel === 'read') {
    throw new Response("You are not authorized to edit this collection", { status: 401 });
  }

  return prisma.userRecipeCollection.deleteMany({
    where: {
      recipeId,
      collectionId,
      userId: requestingUserId,
    }
  });
}

export async function getCollectionRecipes(collectionId: Collection["id"], requestingUserId: User["id"]) {
  const userAccess = await getCollectionAccess(collectionId, requestingUserId);
  if (!userAccess || userAccess.accessLevel === 'read') {
    throw new Response("You are not authorized to view this collection", { status: 401 });
  }

  return prisma.userRecipeCollection.findMany({
    where: {
      collectionId,
    }
  });
}