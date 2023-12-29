import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  Form,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

import { recipeAction } from "~/recipes/recipe-actions";
import { loadSingleRecipe } from "~/recipes/recipe-loader";
import { FormTextAreaInput, FormTextInput } from "~/components/forms";
import { SubmissionStyles } from "~/components/recipes";
import { useIngredientsForm } from "~/components/recipes/use-ingredients-form";
import { useKeyboardSubmit } from "~/components/use-keyboard";
import VisuallyHidden from "~/components/visually-hidden";
import { getDefaultRecipeValues } from "~/utils";
import { isValidString } from "~/utils/strings";

export const loader = async (args: LoaderFunctionArgs) => {
  return await loadSingleRecipe({ ...args, mode: "edit" });
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  return await recipeAction(actionArgs);
};

export default function EditRecipePage() {
  /** The submissionType is the **only** unique value between recipes.new &
   * recipes.edit */
  const submissionType: SubmissionStyles = "edit";

  useKeyboardSubmit(["shift", "enter"], "edit-form");

  /** From here through the return should be **identical** between recipes.new &
   * recipes.edit */
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const titleRef = useRef<HTMLInputElement>(null);
  const prepTimeRef = useRef<HTMLInputElement>(null);
  const cookTimeRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const prepStepsRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<HTMLTextAreaElement[]>([]);
  const ingredientRefs = useRef<(HTMLInputElement | null)[]>([]);

  const defaultValues = getDefaultRecipeValues(data);
  const { ingredients, renderIngredients } = useIngredientsForm(
    defaultValues.recipeIngredients,
  );

  const [steps, setSteps] = useState<string[]>(
    Array.isArray(defaultValues.preparationSteps)
      ? defaultValues.preparationSteps
      : [],
  );

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
    if (ingredients.length === 1) {
      return;
    }
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
    <Form method="post" id="edit-form" className="flex flex-col gap-4 w-full">
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
        forwardRef={titleRef}
        name="title"
        placeholder="Pumpkin Pie"
        error={actionData?.errors.title}
        defaultValue={defaultValues.title}
        autofocus={true}
      />
      <FormTextAreaInput
        forwardRef={descriptionRef}
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
                <textarea
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

      <fieldset>{renderIngredients}</fieldset>
      {/* tags: [] */}

      <FormTextInput
        forwardRef={prepTimeRef}
        name="prepTime"
        placeholder="1h30m"
        error={actionData?.errors.prepTime}
        defaultValue={defaultValues.prepTime}
      />

      <FormTextInput
        forwardRef={cookTimeRef}
        name="cookTime"
        placeholder="1h30m"
        error={actionData?.errors.cookTime}
        defaultValue={defaultValues.cookTime}
      />

      <FormTextInput
        forwardRef={sourceRef}
        name="source"
        placeholder="NYT Cooking"
        error={actionData?.errors.source}
        defaultValue={defaultValues.source}
      />

      <FormTextInput
        forwardRef={sourceUrlRef}
        name="sourceUrl"
        label="Source URL"
        placeholder="https://cooking.nytimes.com/recipes/1015622-pumpkin-pie"
        error={actionData?.errors.sourceUrl}
        defaultValue={defaultValues.sourceUrl}
      />
    </Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 401) {
    return (
      <div>
        {isValidString(error.data) ? error.data : "You do not have access"}
      </div>
    );
  }

  if (error.status === 404) {
    return <div>{isValidString(error.data) ? error.data : "Not found"}</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
