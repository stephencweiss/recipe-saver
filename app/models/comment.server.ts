import { Comment, User } from "@prisma/client";

import { prisma } from "~/db.server";

export interface CreatableComment {
  comment: string,
  isPrivate: boolean,
  submittedBy: User["id"],
}
type EditableComment = Pick<Comment, "id" | "comment" | "isPrivate" | "submittedBy">;

export async function createComment(CreatableComment: CreatableComment): Promise<Comment> {
  const { comment, isPrivate, submittedBy } = CreatableComment;
  const recipeComment = await prisma.comment.create({
    data: {
      comment,
      isPrivate,
      submittedBy,
    }
  });
  return recipeComment;
}

export async function editComment(comment: EditableComment,
  requestingUserId: User["id"]): Promise<Comment> {
    const { id, comment: newComment, isPrivate, submittedBy } = comment;
  console.log(`editComment: ${id}`);
  console.log({ requestingUserId, submittedBy })
  if (requestingUserId !== submittedBy) {
    throw new Error("You are not authorized to edit this comment");
  }
  const recipeComment = await prisma.comment.update({
    where: { id },
    data: {
      comment: newComment,
      isPrivate,
      updatedDate: new Date(),
    }
  });
  return recipeComment;
}