import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import recipePlaceholder from "~/assets/images/recipe-placeholder.jpg";
import Layout from "~/components/layout";
import RecipeCard from "~/components/recipes/recipe-card";
import { RecipesResponse, getRecipes } from "~/models/recipe.server";

const getTruncatedDescription = (
  recipe: Pick<RecipesResponse, "description">,
) => {
  const { description } = recipe;
  if (!description) {
    return "No Description";
  }
  if (description.length > 200) {
    return `${description?.substring(0, 200)}...`;
  }

  return description;
};

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);
  const skip = parseInt(url.searchParams.get("skip") ?? "") || 0;
  const recipes = await getRecipes({ skip, take: 3 });
  return json({ recipes });
};

export default function ExplorePage() {
  const data = useLoaderData<typeof loader>();
  const [recipes, setRecipes] = useState(data?.recipes);
  const [skip, setSkip] = useState<number>(data?.recipes.length);
  const [recipesAvailable, setRecipesAvailable] = useState<boolean>(true);
  const fetcher = useFetcher<{ recipes: RecipesResponse[] }>();

  useEffect(() => {
    if (!fetcher.data || fetcher.state === "loading") {
      return;
    }
    // If we have new data - append it
    if (fetcher.data) {
      const newRecipes = fetcher.data.recipes ?? [];
      console.log({ newRecipes });
      // If the returned number of recipes is fewer than we got on the initial
      // load, it means that we have exhausted the list and we have no more
      // recipes to load.
      if (newRecipes.length < data.recipes?.length) {
        setRecipesAvailable(false);
      }
      setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
      setSkip((prevSkip) => prevSkip + newRecipes.length);
    }
  }, [fetcher.data, fetcher.state]);

  // A method for fetching next page
  const loadNext = () => {
    const query = `?index&skip=${skip}`;
    fetcher.load(query); // this call will trigger the loader with a new query
  };

  return (
    <Layout title="Explore">
      <main>
        <h1>Explore</h1>
        <p>This is the explore page. You can see all the recipes here.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {recipes.map((recipe) => {
            const description = getTruncatedDescription(recipe);
            return (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                description={description}
                image={recipePlaceholder} // TODO: replace with real image
                submitter={recipe.user?.username ?? "Anonymous"}
                tags={recipe.tags.map((rt) => rt.name) ?? []}
                title={recipe.title}
                rating={recipe.rating}
              />
            );
          })}
        </div>
        <button
          className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-500 active:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!recipesAvailable}
          onClick={loadNext}
        >
          Load more
        </button>
      </main>
    </Layout>
  );
}
