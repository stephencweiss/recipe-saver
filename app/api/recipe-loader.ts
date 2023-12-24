import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { RecipeUserArgs, getPrivateRecipeComments, getPublicRecipeComments, getRecipeWithIngredients } from "~/models/recipe.server";
import { getUser } from "~/session.server";
import { isNotPlaceholderIngredient, parsePreparationSteps } from "~/utils";

/** A common loader for a specific recipe; include the requesting user */
export async function loadSingleRecipe({ params, request, mode }: LoaderFunctionArgs & { mode: 'edit' | 'view' }) {
  invariant(params.recipeId, "recipeId not found");
  const user = await getUser(request);

  const args: RecipeUserArgs = { id: params.recipeId };
  if (user) {
    args['requestingUser'] = user
  }

  const rawRecipe = await getRecipeWithIngredients(args);
  const privateComments = await getPrivateRecipeComments(args);
  const publicComments = await getPublicRecipeComments(args);
  if (!rawRecipe) {
    throw new Response("Not Found", { status: 404 });
  }
  if (rawRecipe.isPrivate && rawRecipe.submittedBy !== user?.id) {
    throw new Response("Not Found", { status: 404 });
  }
  if (mode == 'edit' && rawRecipe.submittedBy !== user?.id) {
    throw new Response("Cannot Edit Recipe Owned by Other User", { status: 401 });
  }

  const recipe = {
    ...rawRecipe,
    recipeIngredients: rawRecipe?.recipeIngredients.map(r => ({ ...r, isDeleted: false })).filter(isNotPlaceholderIngredient) ?? [],
    preparationSteps: parsePreparationSteps(rawRecipe.preparationSteps ?? ""),
    privateComments,
    publicComments,
  };
  return json({ recipe, user })
}