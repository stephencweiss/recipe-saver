import type { IngredientFormEntry } from "~/models/recipe.server";
import {
  extractGenericDataFromFormData,
  isNotPlaceholderIngredient,
} from "~/utils";

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
    .map((ingredient) => {
      const { isDeleted } = ingredient;
      return {
        ...ingredient,
        isDeleted: isDeleted ?? false,
      };
    })
    .filter(i => isNotPlaceholderIngredient(i));
}
