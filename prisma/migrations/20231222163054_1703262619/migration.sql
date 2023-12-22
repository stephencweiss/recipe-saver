/*
  Warnings:

  - The primary key for the `recipe_ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `ingredientId` on table `recipe_ingredients` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_ingredients" (
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "id" TEXT,
    "name" TEXT,
    "quantity" TEXT,
    "unit" TEXT,
    "note" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("recipeId", "ingredientId"),
    CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_recipe_ingredients" ("created_date", "id", "ingredientId", "name", "note", "quantity", "recipeId", "unit", "updated_date") SELECT "created_date", "id", "ingredientId", "name", "note", "quantity", "recipeId", "unit", "updated_date" FROM "recipe_ingredients";
DROP TABLE "recipe_ingredients";
ALTER TABLE "new_recipe_ingredients" RENAME TO "recipe_ingredients";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
