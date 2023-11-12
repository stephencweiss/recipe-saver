import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import { getSubmittedRecipes } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const noteListItems = await getSubmittedRecipes({ userId });
  return json({ noteListItems });
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  const [search, setSearch] = useState<string>("");
  const [notes, setNotes] = useState(data.noteListItems);

  useEffect(() => {
    if (search.length == 0) {
      setNotes(data.noteListItems);
    }
    const regExp = new RegExp(search, "i");
    const filteredNotes = data.noteListItems.filter((i) =>
      regExp.test(i.title),
    );
    setNotes(filteredNotes);
  }, [search.length, search, data.noteListItems]);

  const handleSearch = (value: string) => setSearch(value);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex ">
        <div className="w-80 max-h-screen overflow-scroll border-r bg-blue-50 min-w-150">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New Note
          </Link>

          <hr />
          <input
            className="block p-4 w-full text-xl"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search..."
          />
          <hr />

          <div className="flex-1">
            {notes.length === 0 ? (
              <p className="p-4">No notes yet</p>
            ) : (
              <ol>
                {notes.map((note) => (
                  <li key={note.id}>
                    <NavLink
                      className={({ isActive }) =>
                        `block border-b p-4 text-xl ${
                          isActive ? "bg-blue-500" : ""
                        }`
                      }
                      to={note.id}
                    >
                      📝 {note.title}
                    </NavLink>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
