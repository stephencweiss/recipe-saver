import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, Form } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

import { FormTextAreaInput, FormTextInput } from "~/components/forms";
import {
  SUPPORTED_SUBMISSION_STYLES,
  SubmissionStyles,
  createJSONErrorResponse,
  extractDeletedIngredientIdsFromFormData,
  extractIngredientsFromFormData,
} from "~/components/recipes";
import VisuallyHidden from "~/components/visually-hidden";
import {
  IngredientFormEntry,
  createRecipe,
  disassociateIngredientsFromRecipe,
  upsertRecipeWithDetails,
} from "~/models/recipe.server";
import { requireUserId } from "~/session.server";
import { createPlaceholderIngredient, getDefaultRecipeValues } from "~/utils";

/**
 * This loader is *unique* between recipes.new and recipes.edit
 */
export const loader = async () => null;

/**
 * This action is shared between recipes.new and recipes.edit
 * Keep them in sync!
 */
export const action = async ({ request }: ActionFunctionArgs) => {
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
  const partialRecipe = {
    description: String(formData.get("description")),
    ingredients: extractIngredientsFromFormData(formData),
    preparationSteps: Array.from(formData.keys())
      .filter((k) => k.startsWith("steps["))
      .map((k) => String(formData.get(k))),
    source: String(formData.get("source")),
    sourceUrl: String(formData.get("sourceUrl")),
    submittedBy: userId,
    tags: [],
    title: String(formData.get("title")),
  };

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
  switch (formData.get("submissionType")) {
    case "create-manual": {
      const recipe = await createRecipe(partialRecipe);
      return redirect(`/recipes/${recipe.id}`);
    }
    case "edit": {
      const id = String(formData.get("recipeId"));
      await upsertRecipeWithDetails({
        ...partialRecipe,
        id,
        userId,
      });
      const deletedIngredientIds =
        extractDeletedIngredientIdsFromFormData(formData);
      await disassociateIngredientsFromRecipe({ id }, deletedIngredientIds);
      return redirect(`/recipes/${id}`);
    }
    default:
      return createJSONErrorResponse("global", "Unknown submission type");
  }
};

export default function NewRecipePage() {
  /** The submissionType is the **only** unique value between recipes.new &
   * recipes.edit */
  const submissionType: SubmissionStyles = "create-manual";

  /** From here through the return should be **identical** between recipes.new &
   * recipes.edit */
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const titleRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const prepStepsRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<HTMLInputElement[]>([]);
  const ingredientRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [steps, setSteps] = useState<string[]>([""]);
  const defaultValues = getDefaultRecipeValues(data);
  const [ingredients, setIngredients] = useState<IngredientFormEntry[]>(
    defaultValues.ingredients,
  );
  const [deletedIngredients, setDeletedIngredients] = useState<
    IngredientFormEntry[]
  >([]);

  const addIngredient = () => {
    setIngredients([...ingredients, createPlaceholderIngredient()]);
    // Ensure the refs array has the same length as the ingredients array
    ingredientRefs.current = [...ingredientRefs.current, null];
  };

  const updateIngredient = <K extends keyof IngredientFormEntry>(
    index: number,
    field: K,
    value: IngredientFormEntry[K],
  ) => {
    const newIngredients = [...ingredients];
    const ingredient = newIngredients[index];
    ingredient[field] = value;
    setIngredients(newIngredients);
  };

  const deleteIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    const deletedIngredient = newIngredients.splice(index, 1);
    setDeletedIngredients([...deletedIngredients, ...deletedIngredient]);
    setIngredients(newIngredients);
  };

  function addStep() {
    setSteps([...steps, ""]);
  }

  function updateStep(value: string, index: number) {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  }

  function deleteStep(index: number) {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
    // Also update the refs array
    stepsRefs.current.splice(index, 1);
  }

  // Effect to focus the first error field
  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.preparationSteps) {
      prepStepsRef.current?.focus();
    } else if (actionData?.errors?.ingredients) {
      ingredientRefs.current[0]?.focus();
    }
  }, [actionData]);

  // Effect to focus the newly added step input
  useEffect(() => {
    if (steps.length > 0) {
      stepsRefs.current[steps.length - 1]?.focus();
    }
  }, [steps.length]);

  // Automatically focus the newest ingredient name input when a new ingredient is added
  useEffect(() => {
    const lastIngredientIndex = ingredients.length - 1;
    const lastIngredientRef = ingredientRefs.current[lastIngredientIndex];
    lastIngredientRef?.focus();
  }, [ingredients.length]);

  // Ensure we have enough refs to match the number of steps
  useEffect(() => {
    stepsRefs.current = stepsRefs.current.slice(0, steps.length);
  }, [steps]);

  // Set initial focus on title
  // Run on load, and then never again.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <Form method="post" className="flex flex-col gap-4 w-full">
      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
      <VisuallyHidden>
        <label>
          Submission Type&nbsp;
          <input name="submissionType" readOnly={true} value={submissionType} />
        </label>
      </VisuallyHidden>
      <VisuallyHidden>
        <label>
          Recipe ID&nbsp;
          <input name="recipeId" readOnly={true} value={defaultValues.id} />
        </label>
      </VisuallyHidden>
      <FormTextInput
        ref={titleRef}
        name="title"
        placeholder="Pumpkin Pie"
        error={actionData?.errors.title}
        defaultValue={defaultValues.title}
      />
      <FormTextAreaInput
        ref={descriptionRef}
        name="description"
        defaultValue={defaultValues.description ?? ""}
        rows={4}
      />

      <fieldset>
        <div className="flex w-full flex-col gap-2">
          {actionData?.errors?.preparationSteps ? (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.preparationSteps}
            </div>
          ) : null}

          <legend>{`${"Steps".toUpperCase()}`}</legend>
          <div id="stepsList" ref={prepStepsRef}>
            {steps.map((step, index) => (
              <div key={index} className="flex w-full flex-row gap-2 pt-2">
                <input
                  type="text"
                  className="grow rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
                  name={`steps[${index}]`}
                  placeholder="Describe the step"
                  value={step}
                  onChange={(e) => updateStep(e.target.value, index)}
                  /*
                   * The element is sometimes null.
                   * Skipping / returning null in these cases does not affect
                   * functionality. */
                  ref={(el) => (!el ? null : (stepsRefs.current[index] = el))}
                />
                <button
                  type="button"
                  onClick={() => deleteStep(index)}
                  className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addStep}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Add Step
          </button>
        </div>
      </fieldset>

      <fieldset>
        <VisuallyHidden>
          <legend>{`${"Deleted Ingredients".toUpperCase()}`}</legend>

          {deletedIngredients.map((ingredient, index) => (
            <input
              key={ingredient.id}
              name={`deletedIngredients[${index}][id]`}
              value={ingredient.id}
            />
          ))}
        </VisuallyHidden>
      </fieldset>

      <fieldset>
        {/* Mobile friendly layout */}
        <div className="md:hidden">
          <legend>{`${"Ingredients".toUpperCase()}`}</legend>
          <div className="border-b border-gray-200 flex flex-col gap-2">
            {ingredients.map((ingredient, index) => (
              <div key={index}>
                <input
                  type="hidden"
                  name={`ingredients[${index}][id]`}
                  value={ingredient.id}
                />
                <div>
                  <label className="font-bold">
                    Name
                    <input
                      id={`ingredient-name-${index}`}
                      type="text"
                      name={`ingredients[${index}][name]`}
                      value={ingredient.name}
                      className="w-full p-2 border-2 rounded border-blue-500"
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      /** The element is sometimes null.
                       * Skipping / returning null in these cases does not affect
                       * functionality. */
                      ref={(el) =>
                        !el ? null : (ingredientRefs.current[index] = el)
                      }
                    />
                  </label>
                  <label>
                    Quantity
                    <input
                      type="number"
                      name={`ingredients[${index}][quantity]`}
                      defaultValue={String(ingredient.quantity)}
                      value={String(ingredient.quantity)}
                      className="w-full p-2 border-2 rounded border-blue-500"
                      onChange={(e) =>
                        updateIngredient(
                          index,
                          "quantity",
                          Number(e.target.value),
                        )
                      }
                    />
                  </label>
                  <label>
                    Unit
                    <input
                      type="text"
                      name={`ingredients[${index}][unit]`}
                      value={String(ingredient.unit)}
                      className="w-full p-2 border-2 rounded border-blue-500"
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Notes
                    <textarea
                      rows={4}
                      name={`ingredients[${index}][note]`}
                      value={String(ingredient.note)}
                      className="w-full p-2 border-2 rounded border-blue-500"
                      onChange={(e) =>
                        updateIngredient(index, "note", e.target.value)
                      }
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => deleteIngredient(index)}
                    className="flex-1 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="flex-1 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Add another ingredient
            </button>
          </div>
        </div>
        <div className="hidden md:block">
          <legend>{`${"Ingredients".toUpperCase()}`}</legend>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody className="">
              {ingredients.map((ingredient, index) => (
                <tr key={index}>
                  <td className="">
                    <VisuallyHidden>
                      <label>
                        Ingredient ID&nbsp;
                        <input
                          readOnly={true}
                          name={`ingredients[${index}][id]`}
                          value={ingredient.id}
                        />
                      </label>
                    </VisuallyHidden>
                    <input
                      type="text"
                      name={`ingredients[${index}][name]`}
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      /** The element is sometimes null.
                       * Skipping / returning null in these cases does not affect
                       * functionality. */
                      ref={(el) =>
                        !el ? null : (ingredientRefs.current[index] = el)
                      }
                    />
                  </td>
                  <td className="">
                    <input
                      type="number"
                      name={`ingredients[${index}][quantity]`}
                      defaultValue={String(ingredient.quantity)}
                      value={String(ingredient.quantity)}
                      onChange={(e) =>
                        updateIngredient(
                          index,
                          "quantity",
                          Number(e.target.value),
                        )
                      }
                    />
                  </td>
                  <td className="">
                    <input
                      type="text"
                      name={`ingredients[${index}][unit]`}
                      defaultValue={String(ingredient.unit)}
                      value={String(ingredient.unit)}
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                    />
                  </td>
                  <td className="">
                    <input
                      type="text"
                      name={`ingredients[${index}][note]`}
                      defaultValue={String(ingredient.note)}
                      value={String(ingredient.note)}
                      onChange={(e) =>
                        updateIngredient(index, "note", e.target.value)
                      }
                    />
                  </td>
                  <td className="">
                    <button
                      type="button"
                      className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
                      onClick={() => deleteIngredient(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addIngredient}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Add another ingredient
          </button>
        </div>
      </fieldset>
      {/* tags: [] */}

      <FormTextInput
        ref={sourceRef}
        name="source"
        placeholder="NYT Cooking"
        error={actionData?.errors.source}
        defaultValue={defaultValues.source}
      />

      <FormTextInput
        ref={sourceUrlRef}
        name="sourceUrl"
        label="Source URL"
        placeholder="https://cooking.nytimes.com/recipes/1015622-pumpkin-pie"
        error={actionData?.errors.sourceUrl}
        defaultValue={defaultValues.sourceUrl}
      />
    </Form>
  );
}
