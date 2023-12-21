/*
  Warnings:

  - You are about to drop the `user_menu_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_recipe_comments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "user_menu_comments";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "user_recipe_comments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "recipe_comments" (
    "recipeId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("recipeId", "commentId"),
    CONSTRAINT "recipe_comments_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipe_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "menu_comments" (
    "menuId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("menuId", "commentId"),
    CONSTRAINT "menu_comments_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "menu_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
