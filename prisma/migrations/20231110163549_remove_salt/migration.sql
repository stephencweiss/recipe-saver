/*
  Warnings:

  - You are about to drop the column `salt` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
