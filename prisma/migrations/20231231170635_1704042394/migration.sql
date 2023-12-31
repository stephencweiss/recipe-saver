/*
  Warnings:

  - The primary key for the `collection_access` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `collection_access` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_collection_access" (
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL DEFAULT 'read',
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "collectionId"),
    CONSTRAINT "collection_access_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "collection_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_collection_access" ("accessLevel", "collectionId", "created_date", "updated_date", "userId") SELECT "accessLevel", "collectionId", "created_date", "updated_date", "userId" FROM "collection_access";
DROP TABLE "collection_access";
ALTER TABLE "new_collection_access" RENAME TO "collection_access";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
