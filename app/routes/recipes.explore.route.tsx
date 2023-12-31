import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import recipePlaceholder from "~/assets/images/recipe-placeholder.jpg";
import { InfiniteScroller } from "~/components/infinite-scroller";
import { InvisibleTooltip } from "~/components/tooltip";
import RecipeCard from "~/recipes/recipe-card";
import { RecipesResponse, getRecipes } from "~/recipes/recipe.server";

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 10;

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);
  const skip = parseInt(url.searchParams.get("skip") ?? "") || DEFAULT_SKIP;
  const recipes = await getRecipes({ skip, take: DEFAULT_TAKE });
  return json({ recipes });
};

export default function ExploreRecipesPage() {
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
      const newRecipes = fetcher.data?.recipes ?? [];
      // When the returned number of recipes is less than on the initial load,
      // we have exhausted the list and there are no more recipes to load.
      if (newRecipes.length < data.recipes?.length) {
        setRecipesAvailable(false);
      }
      setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
      setSkip((prevSkip) => prevSkip + newRecipes.length);
    }
  }, [fetcher.data, fetcher.state, data?.recipes?.length]);

  const loadNext = () => {
    const query = `?index&skip=${skip}`;
    fetcher.load(query);
  };

  return (
    <InfiniteScroller loading={fetcher.state === "loading"} loadNext={loadNext}>
        <main>
          <div className="grid md:grid-cols-3 md:gap-2">
            {recipes?.map((recipe) => {
              return (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  description={recipe.description ?? ""}
                  image={recipePlaceholder} // TODO: replace with real image
                  submitter={recipe.user?.username ?? "Anonymous"}
                  tags={recipe.tags.map((rt) => rt.name) ?? []}
                  title={recipe.title}
                  rating={recipe.rating}
                  options={{ maxDescriptionLength: 200 }}
                />
              );
            })}
          </div>
          <div>
            <InvisibleTooltip
              displayMessage={!recipesAvailable}
              message={"No more recipes to load!"}
            >
              <button
                className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!recipesAvailable}
              >
                Load More
              </button>
            </InvisibleTooltip>
          </div>
        </main>
    </InfiniteScroller>
  );
}
