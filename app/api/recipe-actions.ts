import { ActionFunctionArgs, redirect } from "@remix-run/node";

import { SUPPORTED_SUBMISSION_STYLES, SubmissionStyles, createJSONErrorResponse, extractDeletedIngredientIdsFromFormData, extractIngredientsFromFormData } from "~/components/recipes";
import { parseRecipeSite } from "~/models/parse.server";
import { CreatableRecipe, createRecipe, disassociateIngredientsFromRecipe, isUpdatableRecipe, updateRecipeWithDetails } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";


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

  const recipe = await createRecipe({...parsedRecipe, submittedBy: userId});
  return redirect(`/recipes/${recipe.id}`);
}

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

  // TODO: Support tags
  const partialRecipe: CreatableRecipe = {
    description: String(formData.get("description")),
    id: String(formData.get("recipeId")),
    ingredients: extractIngredientsFromFormData(formData),
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

  const deletedIngredientIds = extractDeletedIngredientIdsFromFormData(formData);

  switch (formData.get("submissionType")) {
    case "create-manual": {
      return handleCreateManual(partialRecipe);
    }
    case "create-from-url": {
      return handleCreateFromUrl(String(formData.get("sourceUrl")), userId);
    }
    case "edit": {
      return handleEdit(partialRecipe, deletedIngredientIds);
    }
    default:
      return createJSONErrorResponse("global", "Unknown submission type");
  }
}