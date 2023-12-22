import { useState } from "react";
import { c } from "vitest/dist/reporters-5f784f42";

import VisuallyHidden from "~/components/visually-hidden";
import { IngredientFormEntry } from "~/models/recipe.server";
import { createPlaceholderIngredient } from "~/utils";

export const useIngredientsForm = (
  initialIngredients: IngredientFormEntry[],
) => {
  const [ingredients, setIngredients] = useState(
    initialIngredients.map((ingredient) => ({
      ...ingredient,
      isDeleted: false,
    })),
  );

  const handleIngredientChange = <K extends keyof IngredientFormEntry>(
    id: string,
    field: K,
    value: IngredientFormEntry[K],
  ) => {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const newIngredient = createPlaceholderIngredient();
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
  };

  const handleDeleteIngredient = (id: string) => {
    const newIngredients = [...ingredients];
    const index = newIngredients.findIndex((i) => i.id === id);
    newIngredients[index].isDeleted = true;
    setIngredients(newIngredients);
  };

  const renderIngredients = (
    <div>
      <VisuallyHidden>
        <div className="font-bold">
          Deleted Ingredients
        </div>
        {ingredients
          .filter((i) => i.isDeleted)
          .filter(
            (i): i is IngredientFormEntry & { id: string } => i.id != null,
          )
          .map((ingredient, index) => (
            <div key={ingredient.id}>
              <input
                name={`ingredients[${index}][id]`}
                value={ingredient.id}
                readOnly={true}
              />
              <input
                name={`ingredients[${index}][isDeleted]`}
                value={String(ingredient.isDeleted)}
                readOnly={true}
              />
            </div>
          ))}
      </VisuallyHidden>
      {ingredients
        .filter((i) => !i.isDeleted)
        .filter((i): i is IngredientFormEntry & { id: string } => i.id != null)
        .map((ingredient, index) => (
          <details key={ingredient.id} className="[&_svg]:open:-rotate-180">
            {/* <!-- notice here, we have disabled the summary's default triangle/arrow --> */}
            <summary className="flex justify-between cursor-pointer list-none items-center gap-4">
              <div className="flex gap-2">
                {/* <!-- notice here, we added our own triangle/arrow svg --> */}
                <svg
                  className="rotate-0 transform text-blue-700 transition-all duration-300"
                  fill="none"
                  height="20"
                  width="20"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span className="font-bold">
                  {ingredient.name == "" ? "New Ingredient" : ingredient.name}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteIngredient(ingredient.id)}
                  className="flex-1 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400"
                >
                  Delete
                </button>
              </div>
            </summary>

            <input
              type="hidden"
              name={`ingredients[${index}][id]`}
              value={ingredient.id}
            />
            <div>
              <label>
                Name
                <input
                  id={`ingredient-name-${index}`}
                  type="text"
                  name={`ingredients[${index}][name]`}
                  value={ingredient.name}
                  placeholder="tomato"
                  className="w-full p-2 border-2 rounded border-blue-500"
                  onChange={(e) =>
                    handleIngredientChange(
                      ingredient.id,
                      "name",
                      e.target.value,
                    )
                  }
                />
              </label>
              <label>
                Quantity
                <input
                  type="string"
                  name={`ingredients[${index}][quantity]`}
                  value={String(ingredient.quantity)}
                  placeholder="1"
                  className="w-full p-2 border-2 rounded border-blue-500"
                  onChange={(e) =>
                    handleIngredientChange(
                      ingredient.id,
                      "quantity",
                      e.target.value,
                    )
                  }
                />
              </label>
              <label>
                Unit
                <input
                  type="text"
                  name={`ingredients[${index}][unit]`}
                  placeholder="whole"
                  value={String(ingredient.unit)}
                  className="w-full p-2 border-2 rounded border-blue-500"
                  onChange={(e) =>
                    handleIngredientChange(
                      ingredient.id,
                      "unit",
                      e.target.value,
                    )
                  }
                />
              </label>
              <label>
                Notes
                <textarea
                  rows={4}
                  placeholder="diced finely"
                  name={`ingredients[${index}][note]`}
                  value={String(ingredient.note)}
                  className="w-full p-2 border-2 rounded border-blue-500"
                  onChange={(e) =>
                    handleIngredientChange(
                      ingredient.id,
                      "note",
                      e.target.value,
                    )
                  }
                />
              </label>
            </div>
          </details>
        ))}
      <button
        className="flex-1 w-full rounded bg-blue-500 my-2 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        onClick={handleAddIngredient}
      >
        Add Ingredient
      </button>
    </div>
  );

  return { ingredients, renderIngredients };
};
