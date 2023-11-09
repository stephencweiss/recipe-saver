/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `user_invites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `user_invites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_invites_email_key" ON "user_invites"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_invites_phoneNumber_key" ON "user_invites"("phoneNumber");
