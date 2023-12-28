import { User } from "@prisma/client";
import { type ActionFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import {
  CommentTypes,
  editComment,
  isValidCommentType,
} from "~/models/comment.server";
import {
  createRecipeComment,
  deleteRecipeComment,
} from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

// Types
type ActionType = "edit" | "create" | "delete";
type CommentFormData =
  | CreateFormDataDetails
  | DeleteFormDataDetails
  | EditFormDataDetails;

interface ActionDetails {
  actionType: ActionType;
  commentType: CommentTypes;
}
interface CommentFormDataDetails {
  comment: string;
  isPrivate: boolean;
}

type CreateFormDataDetails = CommentFormDataDetails &
  ActionDetails & {
    actionType: "create";
    associatedId: string;
  };

type EditFormDataDetails = CommentFormDataDetails &
  ActionDetails & {
    actionType: "edit";
    commentId: string;
  };

type DeleteFormDataDetails = ActionDetails & {
  actionType: "delete";
  associatedId: string;
  commentId: string;
};

// Type predicates
const isDeleteFormDataDetails = (
  details: CommentFormData,
): details is DeleteFormDataDetails => {
  return (details as DeleteFormDataDetails).actionType === "delete";
};
const isCreateFormDataDetails = (
  details: CommentFormData,
): details is CreateFormDataDetails => {
  return (details as CreateFormDataDetails).actionType === "create";
};
const isEditFormDataDetails = (
  details: CommentFormData,
): details is EditFormDataDetails => {
  return (details as EditFormDataDetails).actionType === "edit";
};

// Main action
export const commentAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = String(formData.get("action"));
  console.log(`action -->`, action);
  switch (request.method) {
    case "POST": {
      switch (action) {
        case "create-comment": {
          const userId = await requireUserId(request);
          return await handleCreateComment(formData, userId);
        }
        case "useful-comment":
          return await handleUsefulComment(formData);
        default:
          throw new Response(`Unsupported comment action: ${action}`, {status: 400});
      }
    }
    case "PUT":
      switch (action) {
        case "edit-comment": {
          const userId = await requireUserId(request);
          return await handleEditComment(formData, userId);
        }
      }
      return { status: 501 };
    case "DELETE":
      switch (action) {
        case "delete-comment": {
          const userId = await requireUserId(request);
          return await handleDeleteComment(formData, userId);
        }
      }
      return { status: 501 };
    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
};

// Helpers
const handleCreateComment = async (
  formData: FormData,
  requestingUserId: User["id"],
) => {
  const details = getCreateDetailsFromFormData(formData);
  if (!isCreateFormDataDetails(details)) {
    throw new Response(`Trying to create a comment with the wrong actionType`, {status: 400});
  }
  const { commentType } = details;
  if (commentType === "recipe") {
    return await createRecipeComment(
      { ...details, recipeId: details.associatedId },
      requestingUserId,
    );
  } else {
    throw new Response(`Unsupported comment type: ${commentType}`, {status: 400});
  }
};

const handleDeleteComment = async (formData: FormData, userId: User["id"]) => {
  const details = getDeleteDetailsFromFormData(formData);
  if (!isDeleteFormDataDetails(details)) {
    throw new Response(`Trying to delete a comment with the wrong actionType`, {status: 400});
  }
  const { commentType, associatedId, commentId } = details;
  if (commentType === "recipe") {
    await deleteRecipeComment(associatedId, commentId, userId);
    return { status: 204 };
  } else {
    throw new Response(`Unsupported comment type: ${commentType}`, {status: 400});
  }
};

const handleEditComment = async (formData: FormData, userId: User["id"]) => {
  const details = getEditDetailsFromFormData(formData);
  if (!isEditFormDataDetails(details)) {
    throw new Response(`Trying to edit a comment with the wrong actionType: ${details.actionType}`, {status: 400});
  }
  const { commentType } = details;
  if (commentType === "recipe") {
    return await editComment(
      {
        ...details,
        id: details.commentId,
      },
      userId,
    );
  } else {
    throw new Response(`Unsupported comment type: ${commentType}`, {status: 400});
  }
};

// TODO: handle useful comment
// This API should update the useful_comment table with the user id and comment id
const handleUsefulComment = async (formData: FormData) => {
  console.log("TODO: handle useful comment", formData);
  return { status: 501 };
};

const getCreateDetailsFromFormData = (formData: FormData): CommentFormData => {
  const type = String(formData.get("comment-type"));
  const associatedId = String(formData.get("associatedId"));
  invariant(associatedId, "recipeId not found");
  invariant(isValidCommentType(type), `Invalid comment type: ${type}`);
  const comment = String(formData.get("comment"));
  invariant(comment, "comment not found");
  const isPrivate = Boolean(formData.get("isPrivate") === "true");
  return {
    actionType: "create",
    commentType: type,
    associatedId,
    comment,
    isPrivate,
  };
};

const getDeleteDetailsFromFormData = (formData: FormData): CommentFormData => {
  const type = String(formData.get("comment-type"));
  const commentId = String(formData.get("commentId"));
  const associatedId = String(formData.get("associatedId"));
  invariant(commentId, "commentId not found");
  invariant(associatedId, "associatedId not found");
  invariant(isValidCommentType(type), `Invalid comment type: ${type}`);
  return {
    actionType: "delete",
    commentType: type,
    commentId,
    associatedId,
  };
};

const getEditDetailsFromFormData = (formData: FormData): CommentFormData => {
  const type = String(formData.get("comment-type"));
  const commentId = String(formData.get("commentId"));
  invariant(commentId, "commentId not found");
  invariant(isValidCommentType(type), `Invalid comment type: ${type}`);
  const comment = String(formData.get("comment"));
  invariant(comment, "comment not found");
  const isPrivate = Boolean(formData.get("isPrivate") === "true");
  return {
    actionType: "edit",
    commentType: type,
    commentId,
    comment,
    isPrivate
  };
};
