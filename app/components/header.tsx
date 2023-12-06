import { Form, Link } from "@remix-run/react";

import { useUser } from "~/utils";

interface HeaderProps {
  title: string;
  route: string;
}

export function Header({ title, route }: Readonly<HeaderProps>): JSX.Element {
  const user = useUser();

  return (
    <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
      <h1 className="text-3xl font-bold">
        <Link to={route}>{title}</Link>
      </h1>
      <Link to="/profile">{user.email}</Link>
      <div className="flex items-center justify-between flex-row gap-4">
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
        <Link
          className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          to={`/user/${user.id}/profile`}
        >
          Profile
        </Link>
      </div>
    </header>
  );
}
