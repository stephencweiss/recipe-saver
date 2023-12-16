import { json } from "@remix-run/node";
import { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getRecipeWithIngredients } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";
import { isNotPlaceholderIngredient, parsePreparationSteps } from "~/utils";

/** A common loader for a specific recipe; include the requesting user */
export async function loadSingleRecipe({ params, request, mode }: LoaderFunctionArgs & {mode: 'edit' | 'view'}) {
  invariant(params.recipeId, "recipeId not found");
  const userId = await requireUserId(request);

  const rawRecipe = await getRecipeWithIngredients({ id: params.recipeId, requestingUser: { id: userId } });
  if (!rawRecipe) {
    throw new Response("Not Found", { status: 404 });
  }
  if(rawRecipe.isPrivate && rawRecipe.submittedBy !== userId) {
    throw new Response("Not Found", { status: 404 });
  }
  if (mode == 'edit' && rawRecipe.submittedBy !== userId) {
    throw new Response("Not Found", { status: 404 });
  }

  const recipe = {
    ...rawRecipe,
    recipeIngredients: rawRecipe?.recipeIngredients.filter(isNotPlaceholderIngredient) ?? [],
    preparationSteps: parsePreparationSteps(rawRecipe.preparationSteps ?? ""),
  };
  return json({ recipe, userId })
}