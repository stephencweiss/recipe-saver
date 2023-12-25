import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { editComment } from "~/models/comment.server";
import { createRecipeComment } from "~/models/recipe.server";
import { getUser, requireUser } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json({ user });
};

const getCreateDetailsFromFormData = (formData: FormData) => {
  const type = String(formData.get("comment-type"));
  const associatedId = String(formData.get("associatedId"));
  invariant(associatedId, "recipeId not found");
  return { type, associatedId };
};

const getEditDetailsFromFormData = (formData: FormData) => {
  const type = String(formData.get("comment-type"));
  const commentId = String(formData.get("commentId"));
  invariant(commentId, "commentId not found");
  return { type, commentId };
};

const getCommentFromFormData = (formData: FormData) => {
  const userId = String(formData.get("userId"));
  invariant(userId, "userId not found");
  const comment = String(formData.get("comment"));
  invariant(comment, "comment not found");
  const isPrivate = Boolean(formData.get("isPrivate") === "true");
  const partialComment = { comment, submittedBy: userId, isPrivate };
  return partialComment;
};

const handleEditComment = async (formData: FormData, userId: string) => {
  const editDetails = getEditDetailsFromFormData(formData);
  const commentDetails = getCommentFromFormData(formData);
  console.log({ editDetails, commentDetails })
  if (editDetails.type === "recipe")
    return await editComment(
      {
        ...commentDetails,
        id: editDetails.commentId,
      },
      userId,
    );
  else {
    throw new Error(`Unsupported comment type: ${editDetails.type}`);
  }
};

const handleCreateComment = async (formData: FormData) => {
  const createDetails = getCreateDetailsFromFormData(formData);
  const partialComment = getCommentFromFormData(formData);
  if (createDetails.type === "recipe") {
    const recipeComment = {
      ...partialComment,
      recipeId: createDetails.associatedId,
    };
    return await createRecipeComment(recipeComment);
  } else {
    throw new Error(`Unsupported comment type: ${createDetails.type}`);
  }
};

// TODO: handle useful comment
// This API should update the useful_comment table with the user id and comment id
const handleUsefulComment = async (formData: FormData) => {
  return { status: 501 };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const action = String(formData.get("action"));

  console.log(`in the right place`);
  console.log({ action, method: request.method });
  switch (request.method) {
    case "POST": {
      console.log(`reached post action`);
      switch (action) {
        case "create-comment":
          return await handleCreateComment(formData);
        case "useful-comment":
          return await handleUsefulComment(formData);
        default:
          throw new Error(`Unsupported comment action: ${action}`);
      }
    }
    case "PUT":
      switch (action) {
        case "edit-comment": {
          const user = await requireUser(request);

          return await handleEditComment(formData, user.id);
        }
      }
      console.log(`reached put action`);
      return { status: 501 };

    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
};

interface CommentProps {
  username: string;
  submittedBy: string;
  date: string;
  comment: string;
  isPrivate: boolean;
  usefulCount: number;
  commentId: string;
  associatedId: string; // e.g., recipeId, menuId, etc.
}

// Comment Component
const Comment = ({
  associatedId,
  username,
  date,
  comment,
  usefulCount,
  isPrivate: isPrivateOriginal,
  submittedBy,
  userId,
  commentId,
  type,
}: CommentProps & {
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
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (editFetcher.state === "idle") {
      setIsEditing(false);
    }
  }, [editFetcher]);

  const showEdit = submittedBy === userId;

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
        {/* {isPrivate ? <div>Private</div> : <div>Public</div>} */}
        <div className="flex gap4">
          {showEdit ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 mr-2 disabled:bg-gray-400"
            >
              Edit
            </button>
          ) : (
            <></>
          )}
          <deleteFetcher.Form method="delete">
            <input type="hidden" name="action" value="delete-comment" />
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
      </div>
    </div>
  );

  const editingView = (
    <editFetcher.Form method="put" action="/api/comments">
      <CommentFormUi
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
      </CommentFormUi>
    </editFetcher.Form>
  );

  const view = isEditing ? editingView : readView;
  return view;
};

const commentCounts = (comments: CommentProps[]) => {
  const counts = {
    all: comments.length,
    helpful: comments.filter((c) => c.usefulCount > 0).length,
    private: comments.filter((c) => c.isPrivate).length,
  };
  return counts;
};

const useCommentForm = ({
  isPrivate: isPrivateOriginal,
  note: noteOriginal,
}: {
  isPrivate: boolean;
  note: string;
}) => {
  const [note, setNote] = useState(noteOriginal ?? "");
  const [isPrivate, setIsPrivate] = useState(isPrivateOriginal ?? false);
  const reset = () => {
    setNote("");
    setIsPrivate(false);
  };

  return { note, setNote, isPrivate, setIsPrivate, reset };
};

const CommentFormUi = ({
  children,
  isPrivate,
  note,
  setNote,
  setIsPrivate,
  reset,
  userId,
}: React.PropsWithChildren<{
  isPrivate: boolean;
  note: string;
  setNote: (note: string) => void;
  setIsPrivate: (isPrivate: boolean) => void;
  reset: () => void;
  userId?: string;
}>) => {
  return (
    <>
      {children}
      <input type="hidden" name="isPrivate" value={String(isPrivate)} />
      <textarea
        name="comment"
        className="w-full p-2 border border-gray-300 rounded mb-2"
        placeholder="Share your notes with other cooks or make a private note for yourself..."
        value={note}
        rows={4}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <button
            type="button"
            className={`px-4 py-1 rounded-l-full ${
              isPrivate
                ? "bg-slate-600 text-blue-100"
                : "bg-blue-500 text-white"
            }`}
            onClick={() => setIsPrivate(false)}
          >
            Public
          </button>
          <button
            type="button"
            className={`px-4 py-1 rounded-r-full ${
              !isPrivate
                ? "bg-slate-600 text-blue-100"
                : "bg-blue-500 text-white"
            }`}
            onClick={() => setIsPrivate(true)}
          >
            Private
          </button>
        </div>
        <div>
          <button
            type="button"
            className="px-3 py-1 border bg-slate-600 text-blue-100  hover:bg-blue-500 active:bg-blue-600 rounded mr-2"
            onClick={reset}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!userId}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 focus:bg-blue-400 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export const CreateCommentForm = ({
  associatedId,
  type,
}: {
  associatedId: string;
  type: "recipe";
}) => {
  const data = useLoaderData<typeof loader>();
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
  }, [commentFormFetcher]);

  return (
    <commentFormFetcher.Form
      ref={commentFormRef}
      method="post"
      action="/api/comments"
    >
      <div className="border-t border-gray-300 pt-4 pb-6">
        <h2 className="text-xl font-semibold mb-3">COOKING NOTES</h2>
        <CommentFormUi
          isPrivate={isPrivate}
          note={note}
          setNote={setNote}
          setIsPrivate={setIsPrivate}
          reset={reset}
          userId={data.user?.id}
        >
          <input type="hidden" name="action" value={"create-comment"} />
          <input type="hidden" name="comment-type" value={type} />
          <input type="hidden" name="associatedId" value={associatedId} />
          <input type="hidden" name="userId" value={data.user?.id} />
        </CommentFormUi>
      </div>
    </commentFormFetcher.Form>
  );
};

export const CommentList = ({ comments, type }: { comments: CommentProps[], type: "recipe" }) => {
  const data = useLoaderData<typeof loader>();
  const { user } = data;
  const [view, setView] = useState<"all" | "helpful" | "private">("all");
  const counts = commentCounts(comments);
  const filteredComments = comments.filter((c) => {
    if (view === "all") {
      return true;
    }
    if (view === "helpful") {
      return c.usefulCount > 0;
    }
    if (view === "private") {
      return c.isPrivate && user?.id === c.submittedBy;
    }
  });

  const handleClick = (view: "all" | "helpful" | "private") => {
    setView(view);
  };

  const buttonClass = (buttonId: "all" | "helpful" | "private") => {
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
        <button
          onClick={() => handleClick("helpful")}
          className={buttonClass("helpful")}
        >
          {`Most Helpful (${counts.helpful})`}
        </button>
        <button
          onClick={() => handleClick("private")}
          className={buttonClass("private")}
        >
          {`Private (${counts.private})`}
        </button>
      </div>

      <div className="space-y-4">
        {filteredComments
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .map((commentData, index) => (
            <Comment key={index} type={type} {...commentData} userId={user?.id} />
          ))}
      </div>
    </div>
  );
};
