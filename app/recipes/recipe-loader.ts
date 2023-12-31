import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getRecipeWithIngredients } from "~/recipes/recipe.server";
import { getUser } from "~/session.server";
import { getCookCounts } from "~/users/user.cooklog.server";
import { isNotPlaceholderIngredient, parsePreparationSteps } from "~/utils";

/** A common loader for a specific recipe; include the requesting user */
export async function loadSingleRecipe({ params, request, mode }: Pick<LoaderFunctionArgs, "params" | "request"> & { mode: 'edit' | 'view';}) {
  invariant(params.recipeId, "recipeId not found");
  const user = await getUser(request);
  const userId = user?.id

  const rawRecipe = await getRecipeWithIngredients(params.recipeId, userId);
  if (!rawRecipe) {
    throw new Response("Not Found", { status: 404 });
  }
  if (rawRecipe.isPrivate && rawRecipe.submittedBy !== userId) {
    throw new Response("Not Found", { status: 404 });
  }
  if (mode == 'edit' && rawRecipe.submittedBy !== userId) {
    throw new Response("Cannot edit a recipe owned by another user", { status: 401 });
  }

  const cookCounts = await getCookCounts(params.recipeId, userId);

  const recipe = {
    ...rawRecipe,
    recipeIngredients: rawRecipe?.recipeIngredients.map(r => ({ ...r, isDeleted: false })).filter(isNotPlaceholderIngredient) ?? [],
    preparationSteps: parsePreparationSteps(rawRecipe.preparationSteps ?? ""),
    cookCounts
  };
    return { recipe, user };
}