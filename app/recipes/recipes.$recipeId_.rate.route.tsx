import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import VisuallyHidden from "~/components/visually-hidden";
import {
  getUserRatingsForAssociatedId,
  submitRating,
} from "~/rating/rating.server";
import { useStarRating } from "~/rating/use-star-rating";
import { getUserId } from "~/session.server";
import { isValidString } from "~/utils/strings";

import { loadSingleRecipe } from "./recipe-loader";

export async function loader(args: LoaderFunctionArgs) {
  const { params, request } = args;
  const recipeId = String(params.recipeId);
  const { recipe } = await loadSingleRecipe({ ...args, mode: "view" });
  const userId = await getUserId(request);
  const rating = await getUserRatingsForAssociatedId({
    ratingType: "recipe",
    associatedId: recipeId,
    userId,
  });

  return { rating, recipe };
}

export function action(args: ActionFunctionArgs) {
  const { request } = args;
  switch (request.method) {
    case "POST": {
      return handleRecipeRating(args);
    }
  }
}

async function handleRecipeRating(args: ActionFunctionArgs) {
  const { request, params } = args;
  const recipeId = String(params.recipeId);
  const formData = await request.formData();
  const action = String(formData.get("action"));
  console.log({ formData, action });
  switch (action) {
    case "rate-recipe": {
      const userId = await getUserId(request);
      const rating = Number(formData.get("rating"));
      await submitRating({
        associatedId: recipeId,
        userId,
        rating,
        ratingType: "recipe",
      });
      return redirect(`/recipes/${recipeId}`);
    }
    case "skip-rating": {
      return redirect(`/recipes/${recipeId}`);
    }
    default: {
      throw new Response(`Unknown action ${action}`, { status: 400 });
    }
  }
}

export default function RecipeRatingPage() {
  const data = useLoaderData<typeof loader>();

  const { rating, StarRatingUi } = useStarRating({
    type: "interactive",
    ratingType: "recipe",
    associatedId: data.recipe.id,
    originalRating: data.rating,
  });

  return (
    <div className="text-xl sm:text-lg">
      <div className="flex flex-col justify-between gap-4">
        <h2 className="text-4xl font-bold">{data.recipe?.title}</h2>

        <h1 className="text-xl sm:text-lg font-bold">Recipe Rating: {rating}</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <StarRatingUi />

          <form method="post">
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <VisuallyHidden>
                {rating}
                <input type="hidden" readOnly name="rating" value={rating} />
              </VisuallyHidden>
              <button
                type="submit"
                value="rate-recipe"
                name="action"
                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 active:bg-yellow-400 focus:bg-yellow-700 disabled:bg-gray-400"
              >
                Rate
              </button>
              <button
                type="submit"
                value="skip-rating"
                name="action"
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 disabled:bg-gray-400"
              >
                Skip
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
