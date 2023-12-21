-- AlterTable
ALTER TABLE "events" ADD COLUMN "is_private" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN "is_private" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submittedBy" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "is_private" BOOLEAN DEFAULT false,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_recipe_comments" (
    "recipeId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("recipeId", "commentId"),
    CONSTRAINT "user_recipe_comments_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_recipe_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_menu_comments" (
    "menuId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("menuId", "commentId"),
    CONSTRAINT "user_menu_comments_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_menu_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_comments" (
    "eventId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    PRIMARY KEY ("eventId", "commentId"),
    CONSTRAINT "event_comments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
