import { Outlet } from "@remix-run/react";

import Layout from "~/components/layout";
import { useUser } from "~/utils";

export default function UserProfile() {
  const user = useUser();
  return (
    <Layout title="Profile">
      <main className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold py-4 px-2">
          User Profile for {user.username}
        </h2>
        <Outlet />
      </main>
    </Layout>
  );
}
