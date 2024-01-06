-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submittedBy" TEXT,
    "comment" TEXT NOT NULL,
    "is_private" BOOLEAN DEFAULT false,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_comments" ("comment", "created_date", "id", "is_private", "submittedBy", "updated_date") SELECT "comment", "created_date", "id", "is_private", "submittedBy", "updated_date" FROM "comments";
DROP TABLE "comments";
ALTER TABLE "new_comments" RENAME TO "comments";
CREATE TABLE "new_useful_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "userId" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "useful_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "useful_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_useful_comments" ("commentId", "created_date", "id", "updated_date", "userId") SELECT "commentId", "created_date", "id", "updated_date", "userId" FROM "useful_comments";
DROP TABLE "useful_comments";
ALTER TABLE "new_useful_comments" RENAME TO "useful_comments";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
