import { InvisibleTooltip } from "~/components/tooltip";
import VisuallyHidden from "~/components/visually-hidden";
import { isValidString } from "~/utils/strings";

interface CommentFormProps {
  allowAnonymous?: boolean;
  isPrivate: boolean;
  note: string;
  placeholder?: string;
  reset: () => void;
  hidePrivateCheckbox?: boolean;
  setNote: (note: string) => void;
  setIsPrivate: (isPrivate: boolean) => void;
  userId?: string;
}

export const CommentForm = ({
  children,
  allowAnonymous = false,
  isPrivate,
  note,
  placeholder = "Add a comment...",
  reset,
  setNote,
  setIsPrivate,
  hidePrivateCheckbox = false,
  userId,
}: React.PropsWithChildren<CommentFormProps>) => {
  const allowSubmission =
    (allowAnonymous === true || userId !== null) && isValidString(note);

  return (
    <div className="max-w-[500px]">
      {children}
      <VisuallyHidden><input name="isPrivate" value={String(isPrivate)} /></VisuallyHidden>
      <VisuallyHidden><input name="allowAnonymous" value={String(allowAnonymous)} /></VisuallyHidden>
      <textarea
        name="comment"
        className="w-full p-2 border border-gray-300 rounded mb-2"
        placeholder={placeholder}
        value={note}
        rows={4}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-between items-center mb-4">
        {hidePrivateCheckbox === false ? (
          <div className="flex flex-col sm:flex-row">
            <button
              type="button"
              className={`px-4 py-1 rounded-t sm:rounded-none sm:rounded-l ${
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
              className={`px-4 py-1 rounded-b sm:rounded-none sm:rounded-r ${
                !isPrivate
                  ? "bg-slate-600 text-blue-100"
                  : "bg-blue-500 text-white"
              }`}
              onClick={() => setIsPrivate(true)}
            >
              Private
            </button>
          </div>
        ) : (
          <div />
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <InvisibleTooltip
            displayMessage={!isValidString(note)}
            message="Cannot cancel without a note"
          >
            <button
              type="button"
              className="
              px-3 py-1 rounded border
              bg-slate-600 text-blue-100
              hover:bg-blue-500
              active:bg-blue-600
              disabled:bg-gray-400
              disabled:text-white
              "
              onClick={reset}
              disabled={!isValidString(note)}
            >
              Cancel
            </button>
          </InvisibleTooltip>

          <InvisibleTooltip
            displayMessage={!allowSubmission}
            message="Please add a note before you try to submit"
          >
            <button
              type="submit"
              disabled={!allowSubmission}
              className="
              px-3 py-1 rounded
              bg-blue-500 text-white
              hover:bg-blue-600
              focus:bg-blue-400
              active:bg-blue-700
              disabled:bg-gray-400
              "
            >
              Submit
            </button>
          </InvisibleTooltip>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
