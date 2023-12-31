import { LoaderFunctionArgs, json } from "@remix-run/node";

import Layout from "~/components/layout";
import { getRecipes } from "~/recipes/recipe.server";

import ExploreRecipesPage from "./recipes.explore.route";

const DEFAULT_SKIP = 0;
const DEFAULT_TAKE = 10;

export const loader = async (args: LoaderFunctionArgs) => {
  const url = new URL(args.request.url);
  const skip = parseInt(url.searchParams.get("skip") ?? "") || DEFAULT_SKIP;
  const recipes = await getRecipes({ skip, take: DEFAULT_TAKE });
  return json({ recipes });
};
export default function TopLevelExplorePage() {
  return (
    <Layout title="Explore">
      <p className="text-2xl">This is the global explore</p>
      <ExploreRecipesPage />
    </Layout>
  );
}
