import type { Ingredient } from "@prisma/client";

import { IngredientFormEntry } from "~/models/recipe.server";
import {
  extractGenericDataFromFormData,
  isNotPlaceholderIngredient,
} from "~/utils";

export function extractDeletedIngredientIdsFromFormData(
  formData: FormData,
): Pick<Ingredient, "id">[] {
  const deletedIngredientData =
    extractGenericDataFromFormData<IngredientFormEntry>(
      formData,
      "deletedIngredients[",
      /deletedIngredients\[(\d+)\]\[(\w+)\]/,
    );

  return deletedIngredientData
    .filter(
      (ingredient): ingredient is Pick<Ingredient, "id"> =>
        ingredient.id !== undefined,
    )
    .map((ingredient) => ({
      id: ingredient.id,
    }));
}

export function extractIngredientsFromFormData(
  formData: FormData,
): IngredientFormEntry[] {
  const ingredientEntryData =
    extractGenericDataFromFormData<IngredientFormEntry>(
      formData,
      "ingredients[",
      /ingredients\[(\d+)\]\[(\w+)\]/,
    );

  return ingredientEntryData
    .map((ingredient) => ({
      ...ingredient,
      quantity: ingredient.quantity,
    }))
    .filter(isNotPlaceholderIngredient);
}
