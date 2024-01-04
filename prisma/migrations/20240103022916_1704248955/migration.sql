/*
  Warnings:

  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "user_roles_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "user_roles";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "email" TEXT,
    "phoneNumber" TEXT,
    "name" TEXT,
    "status" TEXT DEFAULT 'pending',
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "last_login_date" DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("created_date", "email", "id", "last_login_date", "name", "phoneNumber", "status", "updated_date", "username") SELECT "created_date", "email", "id", "last_login_date", "name", "phoneNumber", "status", "updated_date", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
