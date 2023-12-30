import { ActionFunctionArgs, redirect } from "@remix-run/node";

import { parseRecipeSite } from "~/recipes/recipe.parse.server";
import { CreatableRecipe, createRecipe, disassociateIngredientsFromRecipe, isUpdatableRecipe, updateRecipeWithDetails } from "~/recipes/recipe.server";
import { requireUserId } from "~/session.server";

import { createJSONErrorResponse } from "./recipe-errors";
import { SUPPORTED_SUBMISSION_STYLES, SubmissionStyles } from "./recipe-form-constants";
import { extractIngredientsFromFormData } from "./recipe-ingredient-form-data-extraction";

export async function recipeAction({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const submissionType = String(formData.get("submissionType"));
  if (
    !SUPPORTED_SUBMISSION_STYLES.includes(submissionType as SubmissionStyles)
  ) {
    return createJSONErrorResponse(
      "global",
      `Unknown Submission: ${submissionType}`,
    );
  }

  const ingredientEntryData = extractIngredientsFromFormData(formData)
  const ingredients = ingredientEntryData.filter(i => !i.isDeleted);
  const deletedIngredientsIds = ingredientEntryData.filter(i => i.isDeleted).filter((i): i is { id: string, isDeleted: boolean } => i.id != null).map(i => ({ id: i.id }));

  // TODO: Support tags
  const partialRecipe: CreatableRecipe = {
    cookTime: String(formData.get("cookTime")),
    prepTime: String(formData.get("prepTime")),
    recipeYield: String(formData.get("recipeYield")),
    totalTime: String(formData.get("totalTime")),
    description: String(formData.get("description")),
    id: String(formData.get("recipeId")),
    ingredients,
    preparationSteps: Array.from(formData.keys())
      .filter((k) => k.startsWith("steps["))
      .map((k) => String(formData.get(k))),
    source: String(formData.get("source")),
    sourceUrl: String(formData.get("sourceUrl")),
    submittedBy: userId,
    tags: [],
    title: String(formData.get("title")),
    isPrivate: Boolean(formData.get("isPrivate")),
    userId: userId,
  };

  switch (formData.get("submissionType")) {
    case "create-manual": {
      return handleCreateManual(partialRecipe);
    }
    case "create-from-url": {
      return handleCreateFromUrl(String(formData.get("sourceUrl")), userId);
    }
    case "edit": {
      return handleEdit(partialRecipe, deletedIngredientsIds);
    }
    default:
      return createJSONErrorResponse("global", "Unknown submission type");
  }
}

// Helpers
const handleCreateManual = async (partialRecipe: CreatableRecipe) => {
  // Validate the partialRecipe
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

  const recipe = await createRecipe(partialRecipe);
  return redirect(`/recipes/${recipe.id}`);
}

const handleEdit = async (partialRecipe: CreatableRecipe, deletedIngredientIds: { id: string }[]) => {
  // Validate the partialRecipe
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

  if (partialRecipe.id == null) {
    return createJSONErrorResponse("global", "Recipe ID is required for editing");
  }
  if (!partialRecipe.userId == null) {
    return createJSONErrorResponse("global", "User ID is required for editing");
  }
  if (!isUpdatableRecipe(partialRecipe)) {
    return createJSONErrorResponse("global", "Invalid recipe for editing");
  }

  await updateRecipeWithDetails(partialRecipe);

  await disassociateIngredientsFromRecipe({ id: partialRecipe.id }, deletedIngredientIds);
  return redirect(`/recipes/${partialRecipe.id}`);
}

const handleCreateFromUrl = async (sourceUrl: string, userId: string) => {
  if (sourceUrl == null) {
    return createJSONErrorResponse("sourceUrl", "Source URL is required");
  }

  const parsedRecipe = await parseRecipeSite(sourceUrl ?? '');
  const recipe = await createRecipe({ ...parsedRecipe, submittedBy: userId });
  return redirect(`/recipes/${recipe.id}`);
}
