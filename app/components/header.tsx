import { LinksFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { HTMLProps } from "react";

import { useOptionalUser } from "~/utils";

import { Menu, links as menuLinks } from "./menu";

export const links: LinksFunction = () => [...menuLinks()];

interface HeaderProps {
  title: string;
  className?: HTMLProps<HTMLElement>["className"];
}

const BasicHeader = ({
  className,
  title,
  children,
}: React.PropsWithChildren<Readonly<HeaderProps>>) => {
  console.log("className", className)
  return (
    <header
      className={
        `flex items-center justify-between bg-slate-800 p-4 text-white` +
        " " +
        className
      }
    >
      <h1 className="text-3xl font-bold">
        <Link to="/explore">{title}</Link>
      </h1>

      {children}
    </header>
  );
};

const StandardHeader = ({
  title,
  className,
}: Readonly<HeaderProps>) => {
  const user = useOptionalUser();
  const displayName = user?.name || user?.email;
  return (
    <BasicHeader title={title} className={className}>
      <div className="items-center">
        {displayName ? (
          <Link to={`/user/${user.id}/profile`} className="text-xl">
            {displayName}
          </Link>
        ) : (
          <></>
        )}
      </div>
      <div className="flex flex-row gap-4">
        {user ? (
          <Link
            to="/recipes/new?submissionStyle=create-manual"
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
          </Link>
        ) : (
          <Link
            to="/explore"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-500 active:bg-blue-600"
          >
            Explore
          </Link>
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
    </BasicHeader>
  );
};

export function Header({ title }: Readonly<HeaderProps>): JSX.Element {

  return (
    <>
      <StandardHeader title={title} className={"hidden md:flex"} />
      <BasicHeader title={title} className="md:hidden">
        <div className="w-full flex flex-1 justify-end">
          <Menu />
        </div>
      </BasicHeader>
    </>
  );
}
