/*
  Warnings:

  - You are about to drop the column `category` on the `user_recipes` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `user_recipes` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `user_recipes` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_recipes" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "cook_count" INTEGER DEFAULT 0,
    "last_cooked" DATETIME,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "recipeId"),
    CONSTRAINT "user_recipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_recipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_recipes" ("created_date", "recipeId", "updated_date", "userId") SELECT "created_date", "recipeId", "updated_date", "userId" FROM "user_recipes";
DROP TABLE "user_recipes";
ALTER TABLE "new_user_recipes" RENAME TO "user_recipes";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
