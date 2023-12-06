import { useUser } from "~/utils";


export default function UserProfile() {

  const user = useUser();
  return (
    <div className="flex h-full min-h-screen flex-col">
      <h1>Profile root</h1>
      <code>{JSON.stringify(user, null, 4)}</code>
    </div>
  );
}
