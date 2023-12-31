import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  CommentListAndForm,
  isFlatComment,
} from "~/comments/api.comments.route";
import { getComments } from "~/comments/comment.server";
import { CollapsibleSection } from "~/components/collapsible";
import { List } from "~/components/lists";
import { Time } from "~/components/time";
import TruncateText from "~/components/truncate-text";
import { useKeyboardCombo } from "~/hooks/use-keyboard";
import { loadSingleRecipe } from "~/recipes/recipe-loader";
import { deleteRecipe } from "~/recipes/recipe.server";
import { requireUserId } from "~/session.server";

import { parseIngredients } from "./recipe-ingredient-utils";

export const loader = async (args: LoaderFunctionArgs) => {
  const recipeData = await loadSingleRecipe({ ...args, mode: "view" });
  const comments = await getComments({
    associatedId: recipeData.recipe.id,
    commentType: "recipe",
    userId: recipeData.user?.id,
  });
  return json({ ...recipeData, comments });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.recipeId, "recipeId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "delete-recipe": {
      const userId = await requireUserId(request);
      await deleteRecipe({ id: params.recipeId, userId });
      return redirect("/recipes");
    }
    case "edit-recipe": {
      const userId = await requireUserId(request);
      const recipeData = await loadSingleRecipe({
        params,
        request,
        mode: "view",
      });
      if (recipeData.recipe.submittedBy !== userId) {
        throw new Response("You do not have permission to edit this recipe", {
          status: 401,
        });
      }
      return redirect(`/recipes/${params.recipeId}/edit`);
    }
    default:
      throw new Response(`Unsupported action: ${action}`, { status: 400 });
  }
};

export default function RecipeDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const flatComments = data.comments.filter(isFlatComment);
  useKeyboardCombo(
    ["Shift", "Meta", "e"],
    "edit",
    `/recipes/${data.recipe.id}`,
  );
  const isUsersRecipe = data.user?.id === data.recipe.submittedBy;

  const parsedIngredients = parseIngredients(data.recipe.recipeIngredients);
  return (
    <div>
      {isUsersRecipe ? (
        <div className="flex justify-between gap-4 flex-col lg:flex-row">
          <h2 className="text-4xl font-bold">{data.recipe.title}</h2>
          <div className="flex flex-col-reverse gap-2 justify-between sm:flex-row">
            <Form method="post" className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                value="edit-recipe"
                name="action"
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 disabled:bg-gray-400"
                disabled={!isUsersRecipe}
              >
                Edit
              </button>
              <button
                type="submit"
                value="delete-recipe"
                name="action"
                disabled={!isUsersRecipe}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 disabled:bg-gray-400"
              >
                Delete
              </button>
            </Form>
            <button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 active:bg-yellow-400 focus:bg-yellow-700 disabled:bg-gray-400">
              <Link to="cook">Cook!</Link>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between gap-4 flex-col lg:flex-row">
          <h2 className="text-4xl font-bold">{data.recipe.title}</h2>
          <button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 active:bg-yellow-400 focus:bg-yellow-700 disabled:bg-gray-400">
            <Link to="cook">Cook!</Link>
          </button>
        </div>
      )}

      <div className="flex flex-row gap-4 px-2 py-4">
        <Time label={"Cook Time"} time={data.recipe.cookTime} />
        <Time label={"Prep Time"} time={data.recipe.prepTime} />
        <Time label={"Total Time"} time={data.recipe.totalTime} />
      </div>
      <List
        title="Description"
        items={[data.recipe.description || "No Description"]}
      />
      <List title="Ingredients" items={parsedIngredients} />
      <List title="Steps" items={data.recipe.preparationSteps} ListType="ol" />
      <CollapsibleSection title="Additional Detail">
        <p className="pb-2">Source: {data.recipe.source || "User Submitted"}</p>
        <p className="pb-2 flex items-center max-w-screen-sm">
          URL:&nbsp;
          {data.recipe.sourceUrl ? (
            <TruncateText>
              <a
                className="text-blue-700 inline-block align-middle"
                href={data.recipe.sourceUrl}
              >
                {data.recipe.sourceUrl}
              </a>
            </TruncateText>
          ) : (
            "N/A"
          )}
        </p>

        <p className="pb-2">Submitted by: {data.recipe.user?.username}</p>
      </CollapsibleSection>

      <CollapsibleSection title="Cook Counts">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          {data.recipe.cookCounts.totalCookCount > 0 ? (
            <div className="flex justify-between gap-2">
              <p key="total" className="flex ">
                Community Cook Count:{" "}
                <span className="ml-2 mb-2 inline-block bg-gray-200 rounded px-3 py-1 text-sm font-semibold text-gray-700">
                  {data.recipe.cookCounts.totalCookCount}
                </span>
              </p>
              {data.user ? (
                <p key="user" className="flex">
                  Your Cook Count:{" "}
                  <span className="ml-2 mb-2 inline-block bg-gray-200 rounded px-3 py-1 text-sm font-semibold text-gray-700">
                    {data.recipe.cookCounts.userCookCount}
                  </span>
                </p>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <p className="pb-2">
              No one has cooked this recipe yet! Be the first!
            </p>
          )}
          <button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 active:bg-yellow-400 focus:bg-yellow-700 disabled:bg-gray-400">
            <Link to="cook">Cook!</Link>
          </button>
        </div>
      </CollapsibleSection>

      {data.recipe.recipeTags.map((tag) => (
        <span
          className="inline-block bg-gray-200 rounded px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          key={tag.tag.id}
        >
          {tag.tag.name}
        </span>
      ))}
      <CommentListAndForm
        type="recipe"
        associatedId={data.recipe.id}
        comments={flatComments}
      />
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

  if (error.status === 404) {
    return <div>Page not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
