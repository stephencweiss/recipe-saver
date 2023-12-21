import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import recipePlaceholder from "~/assets/images/recipe-placeholder.jpg";
import { InfiniteScroller } from "~/components/infinite-scroller";
import Layout from "~/components/layout";
import RecipeCard from "~/components/recipes/recipe-card";
import { RecipesResponse, getRecipes } from "~/models/recipe.server";

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 10;

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);
  const skip = parseInt(url.searchParams.get("skip") ?? "") || DEFAULT_SKIP;
  const recipes = await getRecipes({ skip, take: DEFAULT_TAKE });
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
      // When the returned number of recipes is less than on the initial load,
      // we have exhausted the list and there are no more recipes to load.
      if (newRecipes.length < data.recipes?.length) {
        setRecipesAvailable(false);
      }
      setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
      setSkip((prevSkip) => prevSkip + newRecipes.length);
    }
  }, [fetcher.data, fetcher.state, data.recipes?.length]);

  const loadNext = () => {
    const query = `?index&skip=${skip}`;
    fetcher.load(query);
  };

  return (
    <InfiniteScroller loading={fetcher.state === "loading"} loadNext={loadNext}>
      <Layout title="Explore">
        <main>
          <h1>Explore</h1>
          <p>This is the explore page. You can see all the recipes here.</p>
          <div className="grid md:grid-cols-3 md:gap-2">
            {recipes.map((recipe) => {
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
          <button
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-500 active:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!recipesAvailable}
            onClick={loadNext}
          >
            Load more
          </button>
        </main>
      </Layout>
    </InfiniteScroller>
  );
}
