/*
  Warnings:

  - The primary key for the `recipe_rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `recipe_rating` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "recipe_rating_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_rating_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "ratings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_recipe_rating" ("ratingId", "recipeId", "userId") SELECT "ratingId", "recipeId", "userId" FROM "recipe_rating";
DROP TABLE "recipe_rating";
ALTER TABLE "new_recipe_rating" RENAME TO "recipe_rating";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
