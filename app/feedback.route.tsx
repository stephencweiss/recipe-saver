import { CreateCommentForm } from "./comments/api.comments.route";
import Layout from "./components/layout";

export default function FeedbackPage() {
  return (
    <Layout title="Feedback">
      <div className="flex flex-col items-center justify-center h-screen min-w-full">
        <p className="text-xl text-bold text-gray-700 py-4">
          We&apos;d love to hear from you!
        </p>

        <CreateCommentForm
          allowAnonymous={true}
          associatedId=""
          commentType="feedback-comment"
          placeholder="What's on your mind?"
          hidePrivateCheckbox={true}
        />
      </div>
    </Layout>
  );
}
