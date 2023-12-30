import type { IngredientFormEntry } from "~/recipes/recipe.server";
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


export const parseIngredients = (
  ingredients: {
    quantity: string | null;
    unit: string | null;
    name: string | null;
    note: string | null;
  }[],
) =>
  ingredients.map((ingredient) => {
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