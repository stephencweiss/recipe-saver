import { ActionFunctionArgs, json } from "@remix-run/node";
import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react";

import { useUser } from "~/utils";
import { isValidString } from "~/utils/strings";

import { getUserById } from "./user.server";

export const loader = async ({ params }: ActionFunctionArgs) => {
  const userId = params.userId;
  const user = await getUserById(userId ?? "");
  return json({ user });
};

export default function UserProfile() {
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col gap-4">
      <div className="flex justify-end gap-4">

          <Link
            to="edit?update=profile"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 disabled:bg-gray-400"
          >
            Edit Profile
          </Link>

          <Link
            to="edit?update=password"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 active:bg-blue-400 focus:bg-blue-700 disabled:bg-gray-400"
          >
            Change Password
          </Link>

      </div>

      <h2 className="text-xl font-bold py-4">Basic User Info</h2>
      <p className="pb-2">Username: {user.username}</p>
      <p className="pb-2">Email: {user.email ?? "Unknown"}</p>
      <p className="pb-2">Phone: {user.phoneNumber ?? "Unknown"}</p>
      {user.createdDate ? (
        <p className="pb-2">
          Created:{" "}
          {new Date(user.createdDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      ) : null}
      {user.updatedDate ? (
        <p className="pb-2">
          Created:{" "}
          {new Date(user.updatedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      ) : null}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 401) {
    return (
      <div>
        {isValidString(error.data) ? error.data : "You do not have access"}
      </div>
    );
  }

  if (error.status === 404) {
    return <div>{isValidString(error.data) ? error.data : "Not found"}</div>;
  }
  if (error.status === 500) {
    return <div>{isValidString(error.data) ? error.data : "Server error"}</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
