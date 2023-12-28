-- CreateTable
CREATE TABLE "useful_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "useful_comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "useful_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
