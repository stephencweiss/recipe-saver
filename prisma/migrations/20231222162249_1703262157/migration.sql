/*
  Warnings:

  - You are about to drop the `_DietToRecipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `diets` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `recipe_ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "_DietToRecipe_B_index";

-- DropIndex
DROP INDEX "_DietToRecipe_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_DietToRecipe";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "diets";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_ingredients" (
    "id" TEXT,
    "name" TEXT NOT NULL DEFAULT 'ingredient',
    "quantity" TEXT,
    "unit" TEXT,
    "note" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT,

    PRIMARY KEY ("recipeId", "name"),
    CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_recipe_ingredients" ("created_date", "ingredientId", "note", "quantity", "recipeId", "unit", "updated_date") SELECT "created_date", "ingredientId", "note", "quantity", "recipeId", "unit", "updated_date" FROM "recipe_ingredients";
DROP TABLE "recipe_ingredients";
ALTER TABLE "new_recipe_ingredients" RENAME TO "recipe_ingredients";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
