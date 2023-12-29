import { Comment, User } from "@prisma/client";

import { prisma } from "~/db.server";

import { createComment } from "./comment.server";

export async function createFeedbackComment({ comment }: Pick<Comment, "comment">, submittedBy?: User["id"]) {
  const createdComment = await createComment({ comment, isPrivate: false }, submittedBy)
  await prisma.feedbackComment.create({
    data: {
      commentId: createdComment.id,
    },
  });
  return createdComment;
}