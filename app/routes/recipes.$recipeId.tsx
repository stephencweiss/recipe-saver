import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { List } from "~/components/lists";
import { deleteRecipe, getRecipeWithIngredients } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const recipe = await getRecipeWithIngredients({ id: params.recipeId });
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe, userId });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "delete":
      await deleteRecipe({ id: params.recipeId, userId });
      return redirect("/recipes");
    case "edit":
      return redirect(`/recipes/${params.recipeId}/edit`);
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
};

const parseSteps = (steps: string): string[] => {
  const parsedSteps = JSON.parse(steps);
  if (!Array.isArray(parsedSteps)) {
    return [];
  }
  return parsedSteps;
};

export default function RecipeDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const steps = parseSteps(data.recipe.preparationSteps ?? "");
  const isUsersRecipe = data.userId === data.recipe.submittedBy;
  return (
    <div>
      <h2 className="text-4xl font-bold">{data.recipe.title}</h2>
      <List title="Description" items={[data.recipe.description || 'No Description']} />

      <List title="Steps" items={steps} ListType="ol" />
      <List
        title="Ingredients"
        items={data.recipe.ingredients.map(
          (ingredient) =>
            `${ingredient.quantity} ${ingredient.unit} ${ingredient.name} ${
              ingredient.note !== "" ? "" : ` -- ${ingredient.note}`
            }`,
        )}
      />
      <h2 className="text-xl font-bold py-4">Additional Details</h2>
      <p className="pb-2">Source: {data.recipe.source || "User Submitted"}</p>
      <p className="pb-2">URL: {data.recipe.sourceUrl || "N/A"}</p>
      <p className="pb-2">Submitted by: {data.recipe.user?.username}</p>

      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          value="edit"
          name="action"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 mr-2"
          disabled={!isUsersRecipe}
        >
          Edit [Coming Soon]
        </button>
        <button
          type="submit"
          value="delete"
          name="action"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
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
