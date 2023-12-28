/*
  Warnings:

  - Made the column `submittedBy` on table `recipes` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "diets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "diets_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DietToRecipe" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DietToRecipe_A_fkey" FOREIGN KEY ("A") REFERENCES "diets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DietToRecipe_B_fkey" FOREIGN KEY ("B") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "preparation_steps" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "cook_time" TEXT,
    "description" TEXT,
    "is_private" BOOLEAN DEFAULT false,
    "prep_time" TEXT,
    "recipe_yield" TEXT,
    "source" TEXT,
    "source_url" TEXT,
    "total_time" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipes_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_recipes" ("created_date", "description", "id", "is_private", "preparation_steps", "source", "source_url", "submittedBy", "title", "updated_date") SELECT "created_date", "description", "id", "is_private", "preparation_steps", "source", "source_url", "submittedBy", "title", "updated_date" FROM "recipes";
DROP TABLE "recipes";
ALTER TABLE "new_recipes" RENAME TO "recipes";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_DietToRecipe_AB_unique" ON "_DietToRecipe"("A", "B");

-- CreateIndex
CREATE INDEX "_DietToRecipe_B_index" ON "_DietToRecipe"("B");
