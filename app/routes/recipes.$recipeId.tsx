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
import { isNotPlaceholderIngredient, parsePreparationSteps } from "~/utils";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const rawRecipe = await getRecipeWithIngredients({ id: params.recipeId });
  const recipe = {
    ...rawRecipe,
    ingredients: rawRecipe.ingredients.filter(isNotPlaceholderIngredient) ?? [],
    preparationSteps: parsePreparationSteps(rawRecipe.preparationSteps ?? ""),
  };
  if (!rawRecipe) {
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

export default function RecipeDetailsPage() {
  const data = useLoaderData<typeof loader>();

  const isUsersRecipe = data.userId === data.recipe.submittedBy;

  const parsedIngredients = data.recipe.ingredients.map((ingredient) => {
    const { quantity, unit, name, note } = ingredient;
    const q = quantity != null && quantity > 0 ? quantity: "";
    const u = unit != null && unit != 'null' ? unit : "";
    const nt = note != null && note != 'null' ? note : "";
    const nm = name != null && name != 'null' ? name : "";
    return `${q} ${u} ${nm} ${nt != '' ? `-- ${nt}` : ''}`;
  });
  return (
    <div>
      <h2 className="text-4xl font-bold">{data.recipe.title}</h2>
      <List
        title="Description"
        items={[data.recipe.description || "No Description"]}
      />

      <List title="Steps" items={data.recipe.preparationSteps} ListType="ol" />
      <List
        title="Ingredients"
        items={parsedIngredients}
      />
      <h2 className="text-xl font-bold py-4">Additional Details</h2>
      <p className="pb-2">Source: {data.recipe.source || "User Submitted"}</p>
      <p className="pb-2">
        URL:{" "}
        {data.recipe.sourceUrl ? (
          <a className="text-blue-700" href={data.recipe.sourceUrl}>
            {data.recipe.sourceUrl}
          </a>
        ) : (
          "N/A"
        )}
      </p>
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
          Edit
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
