import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

import { IngredientEntry, createRecipe } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

const SUPPORTED_SUBMISSION_STYLES = ["manual"];

type Ingredients = IngredientEntry[];
function extractIngredientsFromFormData(formData: FormData): Ingredients {
  const ingredientEntryData =  Array.from(formData.keys())
  if (!Array.isArray(ingredientEntryData)) {
    throw createJSONErrorResponse(
      "ingredients",
      "Ingredients are required",
    );
  }

  return ingredientEntryData
    .filter((k) => k.startsWith("ingredients["))
    .reduce((acc, k) => {
      // Regular expression to match the pattern and capture the number and name
      const pattern = /ingredients\[(\d+)\]\[(\w+)\]/;
      const match = k.match(pattern);

      if (match) {
        const index = Number(match[1]);
        const name = match[2] as keyof IngredientEntry;
        // Initialize the object at this index if it doesn't exist
        if (!acc[index]) {
          acc[index] = {};
        }
        // Add the property to the object at this index
        acc[index][name] = String(formData.get(k));
      }

      return acc;
    }, [] as Ingredients)
    .map((ingredient) => ({
      ...ingredient,
      quantity: Number(ingredient.quantity),
    }));
}

const createJSONErrorResponse = (
  errorKey: string,
  errorMessage: string,
  status = 400,
) => {
  const defaultErrors = { global: null, title: null, preparationSteps: null, ingredients: null };
  return json(
    { errors: { ...defaultErrors, [errorKey]: errorMessage } },
    { status },
  );
};
export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const submissionType = String(formData.get("submissionType"));
  if (!SUPPORTED_SUBMISSION_STYLES.includes(submissionType)) {
    return createJSONErrorResponse(
      "global",
      `Invalid submission type: ${submissionType}`,
    );
  }

  if (formData.get("submissionType") === "manual") {
    const title = formData.get("title");
    if (typeof title !== "string" || title.length === 0) {
      return createJSONErrorResponse("title", "Title is required");
    }
    const description = String(formData.get("description"));

    const preparationSteps = Array.from(formData.keys())
      .filter((k) => k.startsWith("steps["))
      .map((k) => String(formData.get(k)));

    if (!Array.isArray(preparationSteps)) {
      return createJSONErrorResponse(
        "preparationSteps",
        "Preparation steps are required",
      );
    }
    const ingredients = extractIngredientsFromFormData(formData);
    // TODO: update the form to actually have all of these fields
    const recipe = await createRecipe({
      description,
      title,
      preparationSteps,
      ingredients,
      tags: [],
      submittedBy: userId,
      source: "",
      sourceUrl: "",
    });
    return redirect(`/recipes/${recipe.id}`);
  }
  return createJSONErrorResponse("global", "Unknown submission type");
};

interface Ingredient {
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
}

export default function NewRecipePage() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionyRef = useRef<HTMLTextAreaElement>(null);
  const prepStepsRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<HTMLInputElement[]>([]);
  const ingredientRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [steps, setSteps] = useState<string[]>([""]);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: 0, unit: "", notes: "" },
  ]);

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity: 0, unit: "", notes: "" },
    ]);
    // Ensure the refs array has the same length as the ingredients array
    ingredientRefs.current = [...ingredientRefs.current, null];
  };

  const updateIngredient = <K extends keyof Ingredient>(
    index: number,
    field: K,
    value: Ingredient[K],
  ) => {
    const newIngredients = [...ingredients];
    const ingredient = newIngredients[index];
    ingredient[field] = value;
    setIngredients(newIngredients);
  };

  const deleteIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
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
    }  else if (actionData?.errors?.ingredients) {
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
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
      <input type="hidden" name="submissionType" value="manual" />
      <div>
        {actionData?.errors?.title ? (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        ) : null}
        <label className="flex w-full flex-col gap-2">
          <span>Title</span>
          <input
            ref={titleRef}
            name="title"
            placeholder="Sweet Martha's Famous Chocolate Chip Cookies"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
      </div>

      <fieldset>
        <div className="flex w-full flex-col gap-2">
          {actionData?.errors?.preparationSteps ? (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.preparationSteps}
            </div>
          ) : null}

          <legend>Steps</legend>
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
        {/* Mobile friendly layout */}
        <div className="md:hidden">
          <legend>Ingredients</legend>
          <div className="border-b border-gray-200 flex flex-col gap-2">
            {ingredients.map((ingredient, index) => (
              <div key={index}>
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
                      value={ingredient.quantity}
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
                      value={ingredient.unit}
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
                      name={`ingredients[${index}][notes]`}
                      value={ingredient.notes}
                      className="w-full p-2 border-2 rounded border-blue-500"
                      onChange={(e) =>
                        updateIngredient(index, "notes", e.target.value)
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
          <legend>Ingredients</legend>
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
                      value={ingredient.quantity}
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
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                    />
                  </td>
                  <td className="">
                    <input
                      type="text"
                      name={`ingredients[${index}][notes]`}
                      value={ingredient.notes}
                      onChange={(e) =>
                        updateIngredient(index, "notes", e.target.value)
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
      {/*

    ingredients: [],
    tags: [],
    submittedBy: userId,
    source: '',
    sourceUrl: '', */}
      <div>
        <label className="flex w-full flex-col gap-2">
          <span>Description [Optional]</span>
          <textarea
            ref={descriptionyRef}
            name="description"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
          />
        </label>
      </div>
    </Form>
  );
}
