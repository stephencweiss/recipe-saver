/*
  Warnings:

  - You are about to drop the column `tags` on the `menus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Password" ADD COLUMN "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Password" ADD COLUMN "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "recipe_ingredients" ADD COLUMN "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "recipe_ingredients" ADD COLUMN "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "recipe_rating" ADD COLUMN "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "menu_tags" (
    "menuId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("menuId", "tagId"),
    CONSTRAINT "menu_tags_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_tags_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recipe_tags" (
    "recipeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedBy" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("recipeId", "tagId"),
    CONSTRAINT "recipe_tags_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_tags_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_recipe_tags" ("recipeId", "tagId") SELECT "recipeId", "tagId" FROM "recipe_tags";
DROP TABLE "recipe_tags";
ALTER TABLE "new_recipe_tags" RENAME TO "recipe_tags";
CREATE TABLE "new_menus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "feedsNumPeople" INTEGER,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "menus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_menus" ("created_date", "feedsNumPeople", "id", "name", "updated_date", "userId") SELECT "created_date", "feedsNumPeople", "id", "name", "updated_date", "userId" FROM "menus";
DROP TABLE "menus";
ALTER TABLE "new_menus" RENAME TO "menus";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
