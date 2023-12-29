import { Recipe, RecipeIngredient } from "@prisma/client";
import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

import type { User } from "~/users/user.server";

import { createJSONErrorResponse } from "../recipes/recipes/errors";
import { IngredientFormEntry, CreatableRecipe } from "../recipes/recipe.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * parsePreparationSteps takes a stringified Array and converts it into a JS Array
 * Removes empty strings from the array
 */
export const parsePreparationSteps = (steps: string): string[] => {
  const parsedSteps = JSON.parse(steps);
  if (!Array.isArray(parsedSteps)) {
    return [];
  }
  return parsedSteps.filter((step) => step !== "");
};

export const createPlaceholderIngredient = () => ({
  id: `placeholder-${Date.now().toString()}`,
  name: "",
  quantity: "",
  unit: "",
  note: "",
  isDeleted: false
});

/** Predicate to determine if an ingredient is the placeholder ingredient */
export const isNotPlaceholderIngredient = (
  ingredient: IngredientFormEntry,
): ingredient is IngredientFormEntry => {
  const placeholderIngredient = createPlaceholderIngredient();
  return !(
    ingredient.name === placeholderIngredient.name &&
    ingredient.quantity === placeholderIngredient.quantity &&
    ingredient.unit === placeholderIngredient.unit &&
    ingredient.note === placeholderIngredient.note
  );
};
/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return (
    user != null &&
    typeof user === "object" &&
    "username" in user &&
    typeof user.username === "string"
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

/** A helper function to handle asynchronous actions within a filter of a list */
export async function asyncFilter<T>(
  arr: T[],
  predicate: (arg: T) => Promise<boolean>,
) {
  const results = await Promise.all(arr.map(predicate));
  return arr.filter((_v, index) => results[index]);
}

/** A helper function to handle asynchronous actions within a map of a list */
export async function asyncMap<T>(arr: T[], predicate: (arg: T) => Promise<T>) {
  return Promise.all(arr.map(predicate));
}

/**
 * Expects a fairly specific type of form data, where the keys are in the format:
 *  - `formKeyPrefix[index][keyName]`
 * - e.g. `ingredients[0][name]`
 * This function will extract the data from the form data and return an array of
 * objects with the key/value pairs.
 * - e.g., `[{name: "foo"}, {name: "bar"}]`
 */
export function extractGenericDataFromFormData<
  T extends Record<string, unknown>,
>(formData: FormData, formKeyPrefix: string, pattern: RegExp): Partial<T>[] {
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
    }, [])
    .filter((item) => Object.keys(item).length > 0);
}

const isFullRecipe = (
  data: unknown,
): data is { recipe: Recipe & { recipeIngredients: RecipeIngredient[] } } => {
  const typedData = data as { recipe: (Recipe & { recipeIngredients: RecipeIngredient[] })};
  const isFull = Boolean(typedData?.recipe && Array.isArray(typedData?.recipe.recipeIngredients));
  return isFull;
};

export const getDefaultRecipeValues = (data: unknown) => {
  if (isFullRecipe(data)) {
    return {
      id: data.recipe.id,
      title: data.recipe.title,
      prepTime: data.recipe.prepTime ?? "",
      cookTime: data.recipe.cookTime ?? "",
      description: data.recipe.description ?? "",
      source: data.recipe.source ?? "",
      sourceUrl: data.recipe.sourceUrl ?? "",
      preparationSteps: data.recipe.preparationSteps ?? [''],
      recipeIngredients: data.recipe.recipeIngredients.map(i=> ({...i, isDeleted: false})) ?? [createPlaceholderIngredient()],
    };
  }
  return {
    preparationSteps: [''],
    recipeIngredients: [createPlaceholderIngredient()],
  };
};

export const validateUserSubmittedRecipe = (partialRecipe: CreatableRecipe) => {
  if (partialRecipe.title.length === 0) {
    return createJSONErrorResponse("title", "Title is required");
  }
  if (
    !Array.isArray(partialRecipe.preparationSteps) ||
    partialRecipe.preparationSteps.length === 0
  ) {
    return createJSONErrorResponse(
      "preparationSteps",
      "Preparation steps are required",
    );
  }
}