import { Comment, User } from "@prisma/client";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";

import { getRecipeComments } from "../recipes/recipe.server";

export type CommentTypes =
  | "recipe"
  | "feedback-comment";

export const isValidCommentType = (commentType: string): commentType is CommentTypes => {
  return commentType === "recipe" || commentType === "feedback-comment";
}
export interface CreatableComment {
  comment: string,
  isPrivate: boolean,
}
type EditableComment = Pick<Comment, "id"> & (CreatableComment);
type DeletableComment = Comment["id"];

export interface FlatCommentServer {
  username: string;
  submittedBy: string; // user.id
  comment: string;
  isPrivate: boolean;
  usefulCount: number;
  commentId: string;
  associatedId: string; // e.g., recipeId, menuId, etc.
  commentType: CommentTypes;
}

export interface FlatComment extends FlatCommentServer {
  createdDate: string; // Date | null on the server, but jsonified becomes a string
}

export const deduplicateComments = (comments: FlatCommentServer[]): FlatCommentServer[] => {
  const commentMap = new Map<string, FlatCommentServer>();
  comments.forEach((c) => {
    commentMap.set(c.commentId, c);
  });
  return Array.from(commentMap.values());
};

// This is a little weird, but I want a central place for all comment getters.
// The weird part is that in theory, this will be invoked by many different
// loaders and then redirect those requests to various servers based on the
// commentType
export const getComments = async ({
  associatedId,
  commentType,
  userId,
}: {
  associatedId: string;
  commentType: CommentTypes;
  userId?: User["id"];
}) => {
  invariant(commentType, "type not found");
  invariant(associatedId, "associatedId not found");
  switch (commentType) {
    case "recipe": {
      return await getRecipeComments({
        id: associatedId,
        requestingUser: { id: userId },
      });
    }
    default:
      throw new Response(`Unsupported comment type: ${commentType}`, { status: 400 });
  }
};

export async function createComment(CreatableComment: CreatableComment, requestingUserId?: User["id"]): Promise<Comment> {
  const { comment, isPrivate } = CreatableComment;
  const recipeComment = await prisma.comment.create({
    data: {
      comment,
      isPrivate,
      submittedBy: requestingUserId,
    }
  });
  return recipeComment;
}

export async function editComment(comment: EditableComment,
  requestingUserId: User["id"]): Promise<Comment> {
  const { id, ...commentDetails } = comment;
  const existingComment = await prisma.comment.findUnique({
    where: { id },
  });
  if (requestingUserId !== existingComment?.submittedBy) {
    throw new Response("You are not authorized to edit this comment", { status: 401 });
  }
  const recipeComment = await prisma.comment.update({
    where: { id },
    data: {
      ...commentDetails,
      updatedDate: new Date(),
    }
  });
  return recipeComment;
}

export async function deleteComment(commentId: DeletableComment, requestingUserId: User["id"]): Promise<Comment> {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!existingComment) {
    throw new Response("Comment not found", { status: 404 });
  }
  if (requestingUserId !== existingComment.submittedBy) {
    throw new Response("You are not authorized to delete this comment", { status: 401 });
  }
  const recipeComment = await prisma.comment.delete({
    where: { id: commentId },
  });
  return recipeComment;
}