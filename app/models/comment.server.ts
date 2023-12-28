import { Comment, User } from "@prisma/client";
import { c } from "vitest/dist/reporters-5f784f42";

import { prisma } from "~/db.server";

/** TODO: Support other types */
export type CommentTypes = "recipe";

/**
 * TODO: Support other types
 */
export const isValidCommentType = (commentType: string): commentType is CommentTypes => {
  return commentType === "recipe";
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

export const flattenAndAssociateComment = (
  comment: Comment & {
    usefulCount?: number, // TODO: once this is included in the db, remove this
    user: { id: string, username: string | null, },
  },
  { associatedId, commentType }: { associatedId: string; commentType: CommentTypes },
): FlatCommentServer => ({
  ...comment,
  isPrivate: comment.isPrivate ?? false,
  username: comment.user.username ?? "Anonymous",
  commentId: comment.id,
  usefulCount: comment.usefulCount ?? 0,
  associatedId,
  commentType,
})

export interface FlatComment extends FlatCommentServer {
  createdDate: string; // Date | null on the server, but jsonified becomes a string
}

export const isFlatComment = (comment: FlatCommentServer | FlatComment): comment is FlatComment => {
  return typeof (comment as FlatComment).createdDate == 'string';
}

export const deduplicateComments = (comments: FlatCommentServer[]): FlatCommentServer[] => {
  const commentMap = new Map<string, FlatCommentServer>();
  comments.forEach((c) => {
    commentMap.set(c.commentId, c);
  });
  return Array.from(commentMap.values());
};


export async function createComment(CreatableComment: CreatableComment, requestingUserId: User["id"]): Promise<Comment> {
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