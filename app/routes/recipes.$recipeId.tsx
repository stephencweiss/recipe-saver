import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { loadSingleRecipe } from "~/api/recipe-loader";
import { List } from "~/components/lists";
import { Time } from "~/components/time";
import { useKeyboardCombo } from "~/components/use-keyboard";
import { deleteRecipe } from "~/models/recipe.server";
import { CreateCommentForm, CommentList } from "~/routes/api.comments";
import { requireUserId } from "~/session.server";

export const loader = async (args: LoaderFunctionArgs) => {
  return await loadSingleRecipe({ ...args, mode: "view" });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "delete-recipe":
      await deleteRecipe({ id: params.recipeId, userId });
      return redirect("/recipes");
    case "edit-recipe":
      return redirect(`/recipes/${params.recipeId}/edit`);
    default:
      throw new Error(`Unsupported action: ${action}`);
  }
};

export default function RecipeDetailsPage() {
  const data = useLoaderData<typeof loader>();

  useKeyboardCombo(
    ["Shift", "Meta", "e"],
    "edit",
    `/recipes/${data.recipe.id}`,
  );
  const isUsersRecipe = data.user?.id === data.recipe.submittedBy;

  const parsedIngredients = data.recipe.recipeIngredients.map((ingredient) => {
    const { quantity, unit, name, note } = ingredient;
    const q = quantity != null && quantity != "null" ? quantity : "";
    const u = unit != null && unit != "null" ? unit : "";
    const nt = note != null && note != "null" ? note : "";
    const nm = name != null && name != "null" ? name : "";
    return (
      <div key={`${q}-${u}-${nm}`.trim()}>
        <span>{`${q} ${u} ${nm} `}</span>
        <span className="text-red-500 font-bold">
          {nt != "" ? `-- ${nt}` : ""}
        </span>
      </div>
    );
  });
  return (
    <div>
      {isUsersRecipe ? (
        <>
          <Form method="post">
            <button
              type="submit"
              value="edit-recipe"
              name="action"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 mr-2 disabled:bg-gray-400"
              disabled={!isUsersRecipe}
            >
              Edit
            </button>
            <button
              type="submit"
              value="delete-recipe"
              name="action"
              disabled={!isUsersRecipe}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-gray-400"
            >
              Delete
            </button>
          </Form>
        </>
      ) : (
        <></>
      )}
      <h2 className="text-4xl font-bold">{data.recipe.title}</h2>
      <div className="flex flex-row gap-4 px-2 py-4">
        <Time label={"Cook Time"} time={data.recipe.cookTime} />
        <Time label={"Prep Time"} time={data.recipe.prepTime} />
        <Time label={"Total Time"} time={data.recipe.totalTime} />
      </div>
      <List
        title="Description"
        items={[data.recipe.description || "No Description"]}
      />
      <List title="Steps" items={data.recipe.preparationSteps} ListType="ol" />
      <List title="Ingredients" items={parsedIngredients} />
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
      {data.recipe.recipeTags.map((tag) => (
        <span
          className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          key={tag.tag.id}
        >
          {tag.tag.name}
        </span>
      ))}
      <hr className="my-4" />

      <CreateCommentForm type="recipe" associatedId={data.recipe.id} />

{/* TODO: load the comments based on the type of comments (i.e., recipe) within the component */}
      <CommentList
      type={"recipe"}
        comments={data.recipe.comments.map((c) => ({
          username: c.user.username,
          submittedBy: c.submittedBy,
          date: c.createdDate ?? "",
          comment: c.comment,
          usefulCount: 0, //c.usefulCount,
          isPrivate: c.isPrivate ?? false,
          commentId: c.id,
          associatedId: data.recipe.id,
        }))}
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
