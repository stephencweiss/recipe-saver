-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_cook_logs" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "cook_count" INTEGER DEFAULT 0,
    "last_cooked" DATETIME,
    "first_cooked" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "recipeId"),
    CONSTRAINT "user_cook_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_cook_logs_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_cook_logs" ("cook_count", "first_cooked", "last_cooked", "recipeId", "userId") SELECT "cook_count", "first_cooked", "last_cooked", "recipeId", "userId" FROM "user_cook_logs";
DROP TABLE "user_cook_logs";
ALTER TABLE "new_user_cook_logs" RENAME TO "user_cook_logs";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
