import { User } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import { isRouteErrorResponse, useFetcher, useRouteError } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { commentAction } from "~/api/comment-actions";
import { CommentForm } from "~/components/comments";
import { CommentTypes, FlatComment } from "~/models/comment.server";
import { useOptionalUser } from "~/utils";
import { isValidString } from "~/utils/strings";

import { RequireAuthenticatedUser } from "./api.restricted";

export const action = async (args: ActionFunctionArgs) => {
  return await commentAction(args);
};

export const loader = async () => null

// Ui
const Comment = ({
  associatedId,
  username,
  createdDate,
  comment,
  usefulCount,
  isPrivate: isPrivateOriginal,
  submittedBy,
  userId,
  commentId,
  type,
}: FlatComment & {
  type: "recipe";
  userId?: string;
}) => {
  const editFetcher = useFetcher({ key: "edit-comment" });
  const deleteFetcher = useFetcher({ key: "delete-comment" });
  const usefulFetcher = useFetcher({ key: "useful-comment" });
  const [isEditing, setIsEditing] = useState(false);

  const { note, setNote, isPrivate, setIsPrivate, reset } = useCommentForm({
    isPrivate: isPrivateOriginal,
    note: comment,
  });

  // Format date to a more readable format
  const formattedDate = new Date(createdDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (editFetcher.state === "idle") {
      setIsEditing(false);
    }
  }, [editFetcher]);

  const showEditDeleteActions = submittedBy === userId;
  const handleClick = () => {
    usefulFetcher.submit({});
  };

  const readView = (
    <div className="border-b border-gray-200 py-4">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">{username}</span>
        <span className="text-gray-500 text-sm">{formattedDate}</span>
      </div>
      <p className="text-gray-700 mb-1">{comment}</p>
      <div className="flex justify-between items-center mb-1">
        <usefulFetcher.Form method="post">
          <input type="hidden" name="action" value="useful-comment" />
          <div className="flex items-center text-sm">
            <span>Is this helpful?</span>
            <button
              className="ml-2 flex items-center text-blue-500"
              onClick={handleClick}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                >
                  <title>Plus</title>
                </path>
              </svg>

              {usefulCount}
            </button>
          </div>
        </usefulFetcher.Form>

        {showEditDeleteActions ? (
          <div className="flex gap4">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 mr-2 disabled:bg-gray-400"
            >
              Edit
            </button>
            <deleteFetcher.Form method="delete">
              <input type="hidden" name="action" value="delete-comment" />
              <input type="hidden" name="comment-type" value={type} />
              <input type="hidden" name="associatedId" value={associatedId} />
              <input type="hidden" name="commentId" value={commentId} />
              <input type="hidden" name="submittedBy" value={submittedBy} />
              <input type="hidden" name="isDeleted" value="true" />
              <button
                name="action"
                value="delete-comment"
                type="submit"
                className="text-sm rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 mr-2 disabled:bg-gray-400"
              >
                Delete
              </button>
            </deleteFetcher.Form>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );

  const editingView = (
    <editFetcher.Form method="put" action="/api/comments">
      <CommentForm
        isPrivate={isPrivate}
        note={note}
        setNote={setNote}
        setIsPrivate={setIsPrivate}
        reset={reset}
        userId={userId}
      >
        <input type="hidden" name="action" value={"edit-comment"} />
        <input type="hidden" name="comment-type" value={type} />
        <input type="hidden" name="associatedId" value={associatedId} />
        <input type="hidden" name="commentId" value={commentId} />
        <input type="hidden" name="userId" value={userId} />
      </CommentForm>
    </editFetcher.Form>
  );

  const view = isEditing ? editingView : readView;
  return view;
};

// Hook
const useCommentForm = ({
  isPrivate: isPrivateOriginal,
  note: noteOriginal,
}: {
  isPrivate: boolean;
  note: string;
}) => {
  const [note, setNote] = useState(noteOriginal ?? "");
  const [isPrivate, setIsPrivate] = useState(isPrivateOriginal ?? false);
  const reset = useCallback(() => {
    setNote("");
    setIsPrivate(false);
  }, []);

  return { note, setNote, isPrivate, setIsPrivate, reset };
};

export const CreateCommentForm = ({
  associatedId,
  type,
}: {
  associatedId: string;
  type: "recipe";
}) => {
  const user = useOptionalUser();
  const commentFormRef = useRef<HTMLFormElement>(null);
  const commentFormFetcher = useFetcher({ key: "create-comment" });

  const { note, setNote, isPrivate, setIsPrivate, reset } = useCommentForm({
    isPrivate: false,
    note: "",
  });

  useEffect(() => {
    if (commentFormFetcher.state === "idle") {
      commentFormRef.current?.reset();
      reset();
    }
  }, [commentFormFetcher, reset]);

  const loggedOutView = (type: CommentTypes, associatedId: string) => {
    //  CommentTypes are singular (e.g., recipe), but routes are plural (e.g., recipes/).
    const redirectToUrl = `/${type}s/${associatedId}`;
    return (
      <RequireAuthenticatedUser message={"To submit a comment, please log in or create an account."}
      redirectTo={redirectToUrl}
      />
    );
  };

  const loggedInView = (
    <commentFormFetcher.Form
      ref={commentFormRef}
      method="post"
      action="/api/comments"
    >
      <CommentForm
        isPrivate={isPrivate}
        note={note}
        setNote={setNote}
        setIsPrivate={setIsPrivate}
        reset={reset}
        userId={user?.id}
      >
        <input type="hidden" name="action" value={"create-comment"} />
        <input type="hidden" name="comment-type" value={type} />
        <input type="hidden" name="associatedId" value={associatedId} />
        <input type="hidden" name="userId" value={user?.id} />
      </CommentForm>
    </commentFormFetcher.Form>
  );
  return (
    <div className="border-t border-gray-300 pt-4 pb-6">
      <h2 className="text-xl font-semibold mb-3">COOKING NOTES</h2>
      {user ? loggedInView : loggedOutView(type, associatedId)}
    </div>
  );
};

type CommentListViews = "all" | "helpful" | "personal";

const commentCounts = (comments: FlatComment[], userId?: User["id"]) => {
  const counts = {
    all: comments.length,
    helpful: comments.filter((c) => c.usefulCount > 0).length,
    personal: comments.filter((c) => c.submittedBy === userId).length,
  };
  return counts;
};

const CommentList = ({
  comments = [],
  type,
}: {
  comments: FlatComment[];
  type: "recipe";
}) => {
  const user = useOptionalUser()

  const [view, setView] = useState<CommentListViews>("all");
  const counts = commentCounts(comments, user?.id);

  const filteredComments = comments.filter((c) => {
    if (view === "all") {
      return true;
    }
    if (view === "helpful") {
      return c.usefulCount > 0;
    }
    if (view === "personal") {
      return user?.id === c.submittedBy;
    }
  });

  const handleClick = (view: CommentListViews) => {
    setView(view);
  };

  const buttonClass = (buttonId: CommentListViews) => {
    if (view === buttonId) {
      return "font-bold";
    }
    return "";
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between border-t border-gray-300 pt-2">
        <button
          onClick={() => handleClick("all")}
          className={buttonClass("all")}
        >
          {`All Notes (${counts.all})`}
        </button>
        {/* TODO: add helpful list back in once it's supported */}
        {/* <button
          onClick={() => handleClick("helpful")}
          className={buttonClass("helpful")}
        >
          {`Most Helpful (${counts.helpful})`}
        </button> */}
        <button
          onClick={() => handleClick("personal")}
          className={buttonClass("personal")}
        >
          {`Personal (${counts.personal})`}
        </button>
      </div>

      <div className="space-y-4">
        {filteredComments
          .sort(
            (a, b) =>
              new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime(),
          )
          .map((commentData, index) => (
            <Comment
              key={index}
              type={type}
              {...commentData}
              userId={user?.id}
            />
          ))}
      </div>
    </div>
  );
};

export const CommentListAndForm = ({
  associatedId,
  type,
  comments,
}: {
  associatedId: string;
  type: "recipe";
  comments: FlatComment[];
}) => {
  return (
    <>
      <CreateCommentForm associatedId={associatedId} type={type} />
      <CommentList type={type} comments={comments} />
    </>
  );
};


export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 401) {
    return (
      <div>
        {isValidString(error.data) ? error.data : "You do not have access"}
      </div>
    );
  }

  if (error.status === 404) {
    return <div>{isValidString(error.data) ? error.data : "Not found"}</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
