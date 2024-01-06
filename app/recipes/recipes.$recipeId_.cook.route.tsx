import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { redirect } from "react-router";

import { CreateCommentForm } from "~/comments/api.comments.route";
import { Checklist } from "~/components/checklist";
import { CollapsibleSection } from "~/components/collapsible";
import { List } from "~/components/lists";
import VisuallyHidden from "~/components/visually-hidden";
import { requireUserId } from "~/session.server";
import { RequireAuthenticatedUser } from "~/users/api.restricted.route";
import { markRecipeAsCooked } from "~/users/user.cooklog.server";
import { isValidString } from "~/utils/strings";

import { parseIngredients } from "./recipe-ingredient-utils";
import { loadSingleRecipe } from "./recipe-loader";

export const loader = async (args: LoaderFunctionArgs) => {
  const recipeData = await loadSingleRecipe({ ...args, mode: "view" });
  return json({ ...recipeData });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const recipeId = String(params.recipeId);
  switch (request.method) {
    case "POST": {
      const formData = await request.formData();
      const action = String(formData.get("action"));
      switch (action) {
        case "edit-recipe": {
          const userId = await requireUserId(request);
          const recipeData = await loadSingleRecipe({
            params,
            request,
            mode: "view",
          });
          if (recipeData.recipe.submittedBy !== userId) {
            throw new Response(
              "You do not have permission to edit this recipe",
              {
                status: 401,
              },
            );
          }
          return redirect(`/recipes/${params.recipeId}/edit`);
        }
        case "cook-recipe": {
          const userId = await requireUserId(request);
          if (!userId)
            throw new Response(
              "Marking a recipe as cooked requires a logged in user",
              { status: 400 },
            );

          if (!recipeId)
            throw new Response(
              "Missing id; cannot mark a recipe as cooked without one",
              { status: 400 },
            );
          await markRecipeAsCooked(recipeId, userId);
          return redirect(`/recipes/${recipeId}/rate`);
        }
        default: {
          throw new Response(`Unknown action ${action}`, { status: 400 });
        }
      }
    }
  }
};

export default function RecipeCookPage() {
  const data = useLoaderData<typeof loader>();
  const isUsersRecipe = data.user?.id === data.recipe.submittedBy;
  return (
    <div className="text-xl sm:text-lg">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <h2 className="text-4xl font-bold">{data.recipe.title}</h2>

        <div className="flex gap-2 mb-2 flex-col sm:flex-row ">
          {isUsersRecipe ? (
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
            </Form>
          ) : (
            <> </>
          )}
          {data.user ? (
            <Form method="POST" className="flex flex-col">
              <VisuallyHidden>
                <input name="action" value="cook-recipe" />
              </VisuallyHidden>
              <button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 active:bg-yellow-400 focus:bg-yellow-700 disabled:bg-gray-400">
                Mark as Cooked
              </button>
            </Form>
          ) : (
            <div className="w-[500px] border rounded px-2 py-4">
              <RequireAuthenticatedUser
                message="Marking a recipe as cooked requires a logged in user"
                redirectTo={`/recipes/${data.recipe.id}`}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xl sm:text-lg font-bold">Cook Statistics</p>
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
            <p className="pb-2 text-xl sm:text-lg">
              No one has cooked this recipe yet! Be the first!
            </p>
          )}
        </div>
      </div>
      <List
        title="Description"
        items={[data.recipe.description || "No description provided"]}
      />
      <CollapsibleSection title={"Ingredients"}>
        <Checklist items={parseIngredients(data.recipe.recipeIngredients)} />
      </CollapsibleSection>
      <CollapsibleSection title={"Steps"}>
        <Checklist items={data.recipe.preparationSteps} />
      </CollapsibleSection>
      <CollapsibleSection title={"Cooking Notes"}>
        <CreateCommentForm
          commentType={"recipe"}
          associatedId={data.recipe.id}
        />
      </CollapsibleSection>
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
