// A remix page that loads a recipe by the recipeId and displays the recipe title, description, and preparation steps.

import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getRecipeWithIngredients } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

// The recipe should be loaded in the loader function and passed to the loader data.
// The recipeId should be a parameter in the route.
// The recipeId should be a number.
// The recipeId should be required.
// The page should not render if the recipeId is missing.
// The page should not render if the recipeId is not a number.
// The page should not render if the recipeId is not found.
// The page should not render if the recipe is not found.
// The recipe should be loaded by the recipeId.
// The recipeId should be extracted from the URL params and passed to the loader function.
// The recipeId should be extracted from the URL params and passed to the action function.

/**
 * The action function should handle the form submission for the delete button.
The action function should handle the form submission for the edit button.
The action function should redirect to the recipes list after a successful delete.
The action function should redirect to the recipe edit page after a successful edit.
The action function should throw an error if the action is not supported.
The action function should redirect to the login page if the user is not logged in.
The action function should redirect to the login page if the user is not the owner of the recipe.
 */
export const action = async ({ params, request }: ActionFunctionArgs) => {};

// The loader function should return a 404 if the recipe cannot be found.
// The loader function should return a 404 if the recipe was not submitted by the logged in user.
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const recipe = await getRecipeWithIngredients({ id: params.recipeId });
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  if (recipe.submittedBy !== userId) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe });
};
// The recipe title should be displayed in an h3 element.
// The recipe description should be displayed in a p element.
// The recipe preparation steps should be displayed in an unordered list.
// The recipe preparation steps should be displayed in an ordered list.
export default function RecipeEditPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      this is where we&apos;ll use the same form as on the *new* page, but we&apos;ll
      pre-populate it with the recipe data that&apos;s been loaded
      <code>
        <pre>{JSON.stringify(data, null, 4)}</pre>
      </code>
    </div>
  );
}
