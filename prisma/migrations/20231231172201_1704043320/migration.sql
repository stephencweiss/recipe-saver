/*
  Warnings:

  - You are about to drop the column `updated_date` on the `user_recipe_collections` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_recipe_collections" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "recipeId", "collectionId"),
    CONSTRAINT "user_recipe_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_recipe_collections_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_recipe_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_recipe_collections" ("collectionId", "created_date", "recipeId", "userId") SELECT "collectionId", "created_date", "recipeId", "userId" FROM "user_recipe_collections";
DROP TABLE "user_recipe_collections";
ALTER TABLE "new_user_recipe_collections" RENAME TO "user_recipe_collections";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
