/*
  Warnings:

  - The primary key for the `recipe_rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `recipe_rating` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `recipe_rating` table. All the data in the column will be lost.
  - You are about to drop the column `submittedBy` on the `recipe_rating` table. All the data in the column will be lost.
  - You are about to drop the column `submitted_date` on the `recipe_rating` table. All the data in the column will be lost.
  - You are about to drop the column `updated_date` on the `recipe_rating` table. All the data in the column will be lost.
  - Added the required column `ratingId` to the `recipe_rating` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "submittedBy" TEXT,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ratings_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
DROP TABLE "recipe_rating";
CREATE TABLE "new_recipe_rating" (
    "recipeId" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "userId" TEXT,

    PRIMARY KEY ("recipeId", "ratingId"),
    CONSTRAINT "recipe_rating_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_rating_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "ratings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
ALTER TABLE "new_recipe_rating" RENAME TO "recipe_rating";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
