-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_useful_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "userId" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "useful_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "useful_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_useful_comments" ("commentId", "created_date", "id", "updated_date", "userId") SELECT "commentId", "created_date", "id", "updated_date", "userId" FROM "useful_comments";
DROP TABLE "useful_comments";
ALTER TABLE "new_useful_comments" RENAME TO "useful_comments";
CREATE TABLE "new_user_recipe_collections" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "recipeId", "collectionId"),
    CONSTRAINT "user_recipe_collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_recipe_collections_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_recipe_collections_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_recipe_collections" ("collectionId", "created_date", "recipeId", "updated_date", "userId") SELECT "collectionId", "created_date", "recipeId", "updated_date", "userId" FROM "user_recipe_collections";
DROP TABLE "user_recipe_collections";
ALTER TABLE "new_user_recipe_collections" RENAME TO "user_recipe_collections";
CREATE TABLE "new_feedback_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    CONSTRAINT "feedback_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_feedback_comments" ("commentId", "id") SELECT "commentId", "id" FROM "feedback_comments";
DROP TABLE "feedback_comments";
ALTER TABLE "new_feedback_comments" RENAME TO "feedback_comments";
CREATE TABLE "new_collection_access" (
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL DEFAULT 'read',
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "collectionId"),
    CONSTRAINT "collection_access_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "collection_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_collection_access" ("accessLevel", "collectionId", "created_date", "updated_date", "userId") SELECT "accessLevel", "collectionId", "created_date", "updated_date", "userId" FROM "collection_access";
DROP TABLE "collection_access";
ALTER TABLE "new_collection_access" RENAME TO "collection_access";
CREATE TABLE "new_menu_comments" (
    "menuId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("menuId", "commentId"),
    CONSTRAINT "menu_comments_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_menu_comments" ("commentId", "menuId") SELECT "commentId", "menuId" FROM "menu_comments";
DROP TABLE "menu_comments";
ALTER TABLE "new_menu_comments" RENAME TO "menu_comments";
CREATE TABLE "new_menu_recipes" (
    "menuId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "addedBy" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("menuId", "recipeId"),
    CONSTRAINT "menu_recipes_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_recipes_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_recipes_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_menu_recipes" ("addedBy", "created_date", "menuId", "recipeId", "updated_date") SELECT "addedBy", "created_date", "menuId", "recipeId", "updated_date" FROM "menu_recipes";
DROP TABLE "menu_recipes";
ALTER TABLE "new_menu_recipes" RENAME TO "menu_recipes";
CREATE TABLE "new_event_comments" (
    "eventId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("eventId", "commentId"),
    CONSTRAINT "event_comments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_event_comments" ("commentId", "eventId") SELECT "commentId", "eventId" FROM "event_comments";
DROP TABLE "event_comments";
ALTER TABLE "new_event_comments" RENAME TO "event_comments";
CREATE TABLE "new_recipe_comments" (
    "recipeId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("recipeId", "commentId"),
    CONSTRAINT "recipe_comments_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipe_comments" ("commentId", "recipeId") SELECT "commentId", "recipeId" FROM "recipe_comments";
DROP TABLE "recipe_comments";
ALTER TABLE "new_recipe_comments" RENAME TO "recipe_comments";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
