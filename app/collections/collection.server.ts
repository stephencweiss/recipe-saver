import { type Collection, type CollectionAccess, type User } from "@prisma/client";

import { prisma } from "~/db.server";

// General Collections

export async function getCollectionById(id: Collection["id"], requestingUserId: User["id"]): Promise<Collection | null> {

  const collection = await prisma.collection.findUnique({
    where: { id },
  });

  if (!collection) {
    return null;
  }

  if (collection.isPrivate) {
    const userAccess = await getCollectionAccess(id, requestingUserId);

    if (!userAccess) {
      throw new Response("You are not authorized to view this collection", { status: 401 });
    }
  }

  return collection;
}

export async function getUserCollections(userId: Collection["userId"]): Promise<Collection[]> {
  return await prisma.collection.findMany({
    where: { userId },
  });
}

export async function createCollection(collection: Omit<Collection, "id" | "createdDate" | "updatedDate">): Promise<Collection> {
  const createdCollection = await prisma.collection.create({
    data: collection,
  });

  await createCollectionAccess(createdCollection.id, collection.userId, 'admin');
  return createdCollection;
}

export async function updateCollection(collection: Collection, requestingUserId: User["id"]): Promise<Collection> {
  const userAccess = await getCollectionAccess(collection.id, requestingUserId);
  if (!userAccess || userAccess.accessLevel === 'read') {
    throw new Response("You are not authorized to edit this collection", { status: 401 });
  }

  return prisma.collection.update({
    where: { id: collection.id },
    data: collection,
  });
}

export async function deleteCollection(id: Collection["id"], requestingUserId: User["id"]): Promise<Collection> {
  const userAccess = await getCollectionAccess(id, requestingUserId);
  if (!userAccess || userAccess.accessLevel !== 'admin') {
    throw new Response("You are not authorized to delete this collection", { status: 401 });
  }

  return prisma.collection.delete({
    where: { id },
  });
}

// Collection Helpers
export async function makeCollectionDefault(collectionId: Collection["id"], userId: User["id"]) {
  const userCollections = await getUserCollections(userId);
  const defaultCollection = userCollections.find((collection) => collection.isDefault);

  if (defaultCollection) {
    await prisma.collection.update({
      where: { id: defaultCollection.id },
      data: { isDefault: false },
    });
  }

  await prisma.collection.update({
    where: { id: collectionId },
    data: { isDefault: true },
  });
}

export async function getDefaultCollectionId(userId: User["id"]) {
  const defaultCollection = await prisma.collection.findFirst({
    where: {
      userId,
      isDefault: true,
    }
  });

  return defaultCollection?.id;
}

// Collection Access
type CollectionAccessLevel = 'read' | 'write' | 'admin';
const isCollectionAccessLevel = (accessLevel: string): accessLevel is CollectionAccessLevel => {
  return ['read', 'write', 'admin'].includes(accessLevel);
}

export async function createCollectionAccess(collectionId: Collection["id"], userId: User["id"], accessLevel: CollectionAccess["accessLevel"]): Promise<CollectionAccess> {
  if (!isCollectionAccessLevel(accessLevel)) {
    throw new Response("Invalid access level", { status: 400 });
  }

  const collectionAccess = await prisma.collectionAccess.create({
    data: {
      collectionId,
      userId,
      accessLevel,
    }
  });

  return collectionAccess;
}

export async function getCollectionAccess(collectionId: Collection["id"], userId: User["id"]) {
  const collectionAccess = await prisma.collectionAccess.findFirst({
    where: {
      collectionId,
      userId,
    },
    orderBy: {
      updatedDate: 'desc',
    }
  });

  return collectionAccess;
}

export async function updateCollectionAccess(collectionId: Collection["id"], userId: User["id"], accessLevel: CollectionAccess["accessLevel"]) {
  if (!isCollectionAccessLevel(accessLevel)) {
    throw new Response("Invalid access level", { status: 400 });
  }

  const collectionAccess = await prisma.collectionAccess.update({
    where: {
      userId_collectionId: {
        collectionId,
        userId,
      }
    },
    data: {
      accessLevel,
    }
  })


  return collectionAccess;
}

export async function deleteCollectionAccess(collectionId: Collection["id"], userId: User["id"]) {
  const collectionAccess = await prisma.collectionAccess.delete({
    where: {
      userId_collectionId: {
        collectionId,
        userId,
      }
    }
  })

  return collectionAccess;
}