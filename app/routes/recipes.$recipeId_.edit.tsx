// A remix page that loads a recipe by the recipeId and displays the recipe title, description, and preparation steps.
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import {
  CompositeIngredient,
  IngredientFormEntry,
  createRecipe,
  getRecipeWithIngredients,
  upsertRecipeWithDetails,
} from "~/models/recipe.server";
import { requireUserId } from "~/session.server";
import { parsePreparationSteps } from "~/utils";

// The recipe should be loaded in the loader function and passed to the loader data.
// The recipeId should be a parameter in the route.
// The recipeId should be a number.
// The recipeId should be required.
// The page should not render if the recipeId is missing.
// The page should not render if the recipeId is not a number.
// The page should not render if the recipeId is not found.
// The page should not render if the recipe is not found.
// The recipe should be loaded by the recipeId.
// The recipeId should be extracted from the URL params and passed to the loader function.
// The recipeId should be extracted from the URL params and passed to the action function.

/**
 * The action function should handle the form submission for the delete button.
 * The action function should handle the form submission for the edit button.
 * The action function should redirect to the recipes list after a successful delete.
 * The action function should throw an error if the action is not supported.
 * The action function should redirect to the login page if the user is not logged in.
 * The action function should redirect to the login page if the user is not the owner of the recipe.
 */
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

  if (formData.get("submissionType") === "edit") {
    const title = formData.get("title");
    if (typeof title !== "string" || title.length === 0) {
      return createJSONErrorResponse("title", "Title is required");
    }
    const description = String(formData.get("description"));
    const source = String(formData.get("source"));
    const id = String(formData.get("recipeId"));
    const sourceUrl = String(formData.get("sourceUrl"));

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
    const recipe = await upsertRecipeWithDetails({
      id,
      description,
      title,
      source,
      sourceUrl,
      preparationSteps,
      tags: [],
      userId,
      ingredients,
    });
    return redirect(`/recipes/${recipe.id}`);
  }
  if (formData.get("submissionType") === "manual") {
    const title = formData.get("title");
    if (typeof title !== "string" || title.length === 0) {
      return createJSONErrorResponse("title", "Title is required");
    }
    const description = String(formData.get("description"));
    const source = String(formData.get("source"));
    const sourceUrl = String(formData.get("sourceUrl"));

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
      source,
      sourceUrl,
    });
    return redirect(`/recipes/${recipe.id}`);
  }
  return createJSONErrorResponse("global", "Unknown submission type");
};

// The loader function should return a 404 if the recipe cannot be found.
// The loader function should return a 404 if the recipe was not submitted by the logged in user.
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const rawRecipe = await getRecipeWithIngredients({ id: params.recipeId });
  if (!rawRecipe) {
    throw new Response("Not Found", { status: 404 });
  }
  if (rawRecipe.submittedBy !== userId) {
    throw new Response("Not Found", { status: 404 });
  }
  const recipe = {
    ...rawRecipe,
    preparationSteps: parsePreparationSteps(rawRecipe.preparationSteps ?? ""),
  }
  if (!rawRecipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe, userId });
};

const SUPPORTED_SUBMISSION_STYLES = [
  // "manual", // Only on the new page
  "edit" // Only on the edit page
];

function extractIngredientsFromFormData(formData: FormData): IngredientFormEntry[] {
  const ingredientEntryData = Array.from(formData.keys());
  if (!Array.isArray(ingredientEntryData)) {
    throw createJSONErrorResponse("ingredients", "Ingredients are required");
  }

  return ingredientEntryData
    .filter((k) => k.startsWith("ingredients["))
    .reduce((acc: IngredientFormEntry[], k) => {
      // Regular expression to match the pattern and capture the number and name
      const pattern = /ingredients\[(\d+)\]\[(\w+)\]/;
      const match = k.match(pattern);

      if (match) {
        const index = Number(match[1]);
        const name = match[2] as keyof IngredientFormEntry;
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
  const defaultErrors = {
    global: null,
    title: null,
    source: null,
    sourceUrl: null,
    preparationSteps: null,
    ingredients: null,
  };
  return json(
    { errors: { ...defaultErrors, [errorKey]: errorMessage } },
    { status },
  );
};

type Ingredient = Partial<CompositeIngredient>

// The recipe title should be displayed in an h3 element.
// The recipe description should be displayed in a p element.
// The recipe preparation steps should be displayed in an unordered list.
// The recipe preparation steps should be displayed in an ordered list.
export default function RecipeEditPage() {
  const data = useLoaderData<typeof loader>();
  const loadedIngredients = data.recipe.ingredients ?? [];
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const prepStepsRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<HTMLInputElement[]>([]);
  const ingredientRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [steps, setSteps] = useState<string[]>(
    data.recipe.preparationSteps ?? [""],
  );

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    loadedIngredients ?? [{ name: "", quantity: 0, unit: "", note: "" }],
  );

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { name: "", quantity: 0, unit: "", note: "" },
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
    <>

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
        <input type="hidden" name="submissionType" value="edit" />
        <input type="hidden" name="recipeId" value={data.recipe.id} />
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
              placeholder="Pumpkin Pie"
              defaultValue={data.recipe.title}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
            />
          </label>
        </div>

        <div>
          <label className="flex w-full flex-col gap-2">
            <span>Description [Optional]</span>
            <textarea
              ref={descriptionRef}
              defaultValue={data.recipe.description ?? ''}
              name="description"
              rows={4}
              className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
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
                  <input type="hidden" name={`ingredients[${index}][id]`} value={ingredient.id} />
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
                        defaultValue={String(ingredient.unit)}
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
                        defaultValue={String(ingredient.note)}
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
                      <input type="hidden" name={`ingredients[${index}][id]`} value={ingredient.id} />
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
        {/*

    tags: [],
*/}

        <div>
          {actionData?.errors?.source ? (
            <div className="pt-1 text-red-700" id="source-error">
              {actionData.errors.source}
            </div>
          ) : null}
          <label className="flex w-full flex-col gap-2">
            <span>Source</span>
            <input
              ref={sourceRef}
              name="source"
              defaultValue={data.recipe.source ?? ''}
              placeholder="NYT Cooking"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.source ? true : undefined}
              aria-errormessage={
                actionData?.errors?.source ? "source-error" : undefined
              }
            />
          </label>
        </div>

        <div>
          {actionData?.errors?.sourceUrl ? (
            <div className="pt-1 text-red-700" id="sourceUrl-error">
              {actionData.errors.sourceUrl}
            </div>
          ) : null}
          <label className="flex w-full flex-col gap-2">
            <span>Source Url</span>
            <input
              ref={sourceUrlRef}
              name="sourceUrl"
              defaultValue={data.recipe.sourceUrl ?? ''}
              placeholder="https://cooking.nytimes.com/recipes/1015622-pumpkin-pie"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.sourceUrl ? true : undefined}
              aria-errormessage={
                actionData?.errors?.sourceUrl ? "sourceUrl-error" : undefined
              }
            />
          </label>
        </div>
      </Form>
      <div>
        this is where we&apos;ll use the same form as on the *new* page, but
        we&apos;ll pre-populate it with the recipe data that&apos;s been loaded
        <code>
          <pre>{JSON.stringify(data, null, 4)}</pre>
        </code>
      </div>

    </>
  );
}
