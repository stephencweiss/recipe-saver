/*
  Warnings:

  - You are about to drop the `request_comments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "request_comments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "feedback_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    CONSTRAINT "feedback_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
