import type { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

import { RecipeUserArgs, getRecipeWithIngredients } from "~/models/recipe.server";
import { getUser } from "~/session.server";
import { isNotPlaceholderIngredient, parsePreparationSteps } from "~/utils";

/** A common loader for a specific recipe; include the requesting user */
export async function loadSingleRecipe({ params, request, mode }: Pick<LoaderFunctionArgs, "params" | "request"> & { mode: 'edit' | 'view';}) {
  invariant(params.recipeId, "recipeId not found");
  const user = await getUser(request);

  const args: RecipeUserArgs = { id: params.recipeId };
  if (user) {
    args['requestingUser'] = user
  }

  const rawRecipe = await getRecipeWithIngredients(args);
  if (!rawRecipe) {
    throw new Response("Not Found", { status: 404 });
  }
  if (rawRecipe.isPrivate && rawRecipe.submittedBy !== user?.id) {
    throw new Response("Not Found", { status: 404 });
  }
  if (mode == 'edit' && rawRecipe.submittedBy !== user?.id) {
    throw new Response("Cannot edit a recipe owned by another user", { status: 401 });
  }

  const recipe = {
    ...rawRecipe,
    recipeIngredients: rawRecipe?.recipeIngredients.map(r => ({ ...r, isDeleted: false })).filter(isNotPlaceholderIngredient) ?? [],
    preparationSteps: parsePreparationSteps(rawRecipe.preparationSteps ?? ""),
  };
    return { recipe, user };
}