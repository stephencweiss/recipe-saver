-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_ingredients" (
    "recipeId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" REAL,
    "unit" TEXT,
    "note" TEXT,

    PRIMARY KEY ("recipeId", "ingredientId"),
    CONSTRAINT "recipe_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipe_ingredients" ("ingredientId", "note", "quantity", "recipeId", "unit") SELECT "ingredientId", "note", "quantity", "recipeId", "unit" FROM "recipe_ingredients";
DROP TABLE "recipe_ingredients";
ALTER TABLE "new_recipe_ingredients" RENAME TO "recipe_ingredients";
CREATE TABLE "new_recipe_tags" (
    "recipeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("recipeId", "tagId"),
    CONSTRAINT "recipe_tags_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipe_tags" ("recipeId", "tagId") SELECT "recipeId", "tagId" FROM "recipe_tags";
DROP TABLE "recipe_tags";
ALTER TABLE "new_recipe_tags" RENAME TO "recipe_tags";
CREATE TABLE "new_recipe_rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipeId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "submitted_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER NOT NULL,
    CONSTRAINT "recipe_rating_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_rating_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_recipe_rating" ("id", "rating", "recipeId", "submittedBy", "submitted_date") SELECT "id", "rating", "recipeId", "submittedBy", "submitted_date" FROM "recipe_rating";
DROP TABLE "recipe_rating";
ALTER TABLE "new_recipe_rating" RENAME TO "recipe_rating";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
