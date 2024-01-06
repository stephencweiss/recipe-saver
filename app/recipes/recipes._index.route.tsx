import { Link } from "@remix-run/react";

export default function RecipeIndexPage() {
  return (
    <p>
      No note selected. Select a note on the left, or{" "}
      <Link to="new?submissionStyle=create-from-url" className="text-blue-500 underline">
        create a new recipe.
      </Link>
    </p>
  );
}
