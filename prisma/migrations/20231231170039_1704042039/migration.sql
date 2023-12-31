/*
  Warnings:

  - Made the column `userId` on table `collections` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_collections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_private" BOOLEAN DEFAULT false,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_collections" ("created_date", "id", "is_private", "name", "updated_date", "userId") SELECT "created_date", "id", "is_private", "name", "updated_date", "userId" FROM "collections";
DROP TABLE "collections";
ALTER TABLE "new_collections" RENAME TO "collections";
CREATE UNIQUE INDEX "collections_name_key" ON "collections"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
