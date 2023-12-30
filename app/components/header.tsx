import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { LinksFunction } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { HTMLProps } from "react";

import { useOptionalUser } from "~/utils";

import { HeaderNavMenu, links as menuLinks } from "./menu";

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
  return (
    <header
      className={
        `flex items-center justify-between bg-slate-800 p-4 text-white
        sticky top-0
        ` +
        " " +
        className
      }
    >
      <HeaderNavMenu>
        <h1 className="text-3xl font-bold">{title}</h1>
        <HamburgerMenuIcon />
      </HeaderNavMenu>
      {children}
    </header>
  );
};

const StandardHeader = ({ title, className }: Readonly<HeaderProps>) => {
  const user = useOptionalUser();
  const displayName = user?.name || user?.email;
  return (
    <BasicHeader title={title} className={className}>
      <div className="items-center hidden md:flex">
        {displayName ? (
          <Link to={`/user/${user.id}/profile`} className="text-xl">
            {displayName}
          </Link>
        ) : (
          <></>
        )}
      </div>

      <div className="flex flex-row gap-4">
        <div className="hidden md:flex">
          {user ? (
            <Link
              to="/recipes/new?submissionStyle=create-from-url"
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
              className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700"
            >
              Explore
            </Link>
          )}
        </div>
        {user ? (
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-slate-600 px-4 py-2 text-blue-100 text-xl hover:bg-blue-600 focus:bg-blue-400 active:bg-blue-700"
            >
              Logout
            </button>
          </Form>
        ) : (
          <></>
        )}
      </div>
    </BasicHeader>
  );
};

export function Header({ title }: Readonly<HeaderProps>): JSX.Element {
  return (
    <>
      <StandardHeader title={title} />
      {/* <BasicHeader title={title} className="md:hidden" /> */}
    </>
  );
}
