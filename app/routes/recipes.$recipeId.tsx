import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteRecipe, getRecipe } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const recipe = await getRecipe({ id: params.recipeId, userId });
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe });
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

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const steps = parseSteps(data.recipe.preparationSteps);

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.recipe.title}</h3>
      <p className="py-6">{data.recipe.description}</p>
      <ul>
        {/*TODO:
        This feels like a good opportunity to move the steps into a component for styling
        and come up with a global way for handling lists. */}
        {steps.map((step, index) => (
          <li key={step}>
            <p className="py-6">
              {index + 1}.&nbsp;{step}
            </p>
          </li>
        ))}
      </ul>
      <p className="py-6">Submitted by: {data.recipe.user?.username}</p>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          value="edit"
          name="action"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 mr-2"
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
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
