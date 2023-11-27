import type { Ingredient } from "@prisma/client";

import { IngredientFormEntry } from "~/models/recipe.server";
import { isNotPlaceholderIngredient } from "~/utils";

function extractGenericDataFromFormData<T extends Record<string, unknown>>(
  formData: FormData,
  formKeyPrefix: string,
  pattern: RegExp,
) {
  const formKeys = Array.from(formData.keys());
  return formKeys
    .filter((k) => k.startsWith(formKeyPrefix))
    .reduce((acc: Partial<T>[], k) => {
      // Regular expression to match the pattern and capture the number and name
      // const pattern = /deletedIngredients\[(\d+)\]\[(\w+)\]/;
      const match = k.match(pattern);

      if (match) {
        const index = Number(match[1]);
        const name = match[2] as keyof T;
        // Initialize the object at this index if it doesn't exist
        if (!acc[index]) {
          acc[index] = {};
        }
        // Add the property to the object at this index
        const value = String(formData.get(k) || "");
        acc[index] = { ...acc[index], [name]: value };
      }

      return acc;
    }, []);
}

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
      quantity: Number(ingredient.quantity),
    }))
    .filter(isNotPlaceholderIngredient);
}
