/*
  Warnings:

  - You are about to drop the `ingredients` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `recipe_ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ingredientId` on the `recipe_ingredients` table. All the data in the column will be lost.
  - Made the column `id` on table `recipe_ingredients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `recipe_ingredients` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "ingredients_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ingredients";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_ingredients" (
    "recipeId" TEXT NOT NULL,
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" TEXT,
    "unit" TEXT,
    "note" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipe_ingredients" ("created_date", "id", "name", "note", "quantity", "recipeId", "unit", "updated_date") SELECT "created_date", "id", "name", "note", "quantity", "recipeId", "unit", "updated_date" FROM "recipe_ingredients";
DROP TABLE "recipe_ingredients";
ALTER TABLE "new_recipe_ingredients" RENAME TO "recipe_ingredients";
CREATE INDEX "recipe_ingredients_name" ON "recipe_ingredients"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
