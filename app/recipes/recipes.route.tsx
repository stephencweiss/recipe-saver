import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, LinksFunction } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import Layout, { links as layoutLinks } from "~/components/layout";
import { getSubmittedRecipes } from "~/recipes/recipe.server";
import { getUser } from "~/session.server";

import { RequireAuthenticatedUser } from "../users/api.restricted.route";

export const links: LinksFunction = () => [...layoutLinks()];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const recipes = user ? await getSubmittedRecipes({ userId: user.id }) : [];
  return json({ recipes, user });
};

export default function RecipesPage() {
  const data = useLoaderData<typeof loader>();

  const [search, setSearch] = useState<string>("");
  const [state, setState] = useState(data.recipes);

  useEffect(() => {
    if (search.length == 0) {
      setState(data.recipes);
    }
    const regExp = new RegExp(search, "i");
    const filteredNotes = data.recipes.filter((i) => regExp.test(i.title));
    setState(filteredNotes);
  }, [search.length, search, data?.recipes]);

  const handleSearch = (value: string) => setSearch(value);

  return (
    <Layout title="Recipes">
      <main className="flex flex-col-reverse md:flex-row">
        <div className="max-h-screen overflow-scroll border-r bg-blue-50 w-full md:min-w-200 md:w-80 ">
          <Link
            to="new?submissionStyle=create-from-url"
            className="
          block p-4 text-xl text-blue-500
          hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 hover:text-white
          "
          >
            + New Recipe
          </Link>
          <hr />
          {data.user ? (
            <>
              <input
                className="block p-4 w-full text-xl"
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search..."
              />
              <hr />

              <div className="flex-1">
                {state.length === 0 ? (
                  <p className="p-4">No recipes yet</p>
                ) : (
                  <ol>
                    {state.map((recipe) => (
                      <li key={recipe.id}>
                        <NavLink
                          className={({ isActive }) =>
                            `block border-b p-4 text-xl
                            hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 hover:text-white
                            ${isActive ? "bg-blue-600 text-white" : ""}`
                          }
                          to={recipe.id}
                        >
                          📝 {recipe.title}
                        </NavLink>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 justify-center">
              <RequireAuthenticatedUser
                message="Sign in to see your recipes here!"
                redirectTo="/recipes"
              />
            </div>
          )}
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </Layout>
  );
}
