import { LinksFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

import { Menu, links as menuLinks } from "./menu";

export const links: LinksFunction = () => [...menuLinks()];

interface HeaderProps {
  title: string;
}

export function Header({ title }: Readonly<HeaderProps>): JSX.Element {
  const user = useOptionalUser();

  const displayName = user?.name || user?.email;
  return (
    <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
      <h1 className="text-3xl font-bold">{title}</h1>
      {displayName ? <p className="text-xl">{displayName}</p> : <></>}
      <div className="flex items-center justify-between flex-row gap-4">
        {user ? (
          <button
            onClick={() =>
              (window.location.href =
                "/recipes/new?submissionStyle=create-manual")
            }
            className="
            px-4 py-2 rounded
            bg-blue-500 text-white text-xl
            hover:bg-blue-600
            focus:bg-blue-400
            active:bg-blue-700
            disabled:bg-gray-400
            "
          >
            + New Recipe
          </button>
        ) : (
          <button
            onClick={() => (window.location.href = "/explore")}
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-500 active:bg-blue-600"
          >
            Explore
          </button>
        )}

        {user ? (
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-500 active:bg-blue-600"
            >
              Logout
            </button>
          </Form>
        ) : (
          <></>
        )}
        <Menu />
      </div>
    </header>
  );
}
