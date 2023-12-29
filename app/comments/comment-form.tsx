export const CommentForm = ({
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
            disabled={!userId || !note}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 focus:bg-blue-400 disabled:bg-gray-400 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default CommentForm;
