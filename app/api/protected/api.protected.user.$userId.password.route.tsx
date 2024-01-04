import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getUserById, updateUserPassword } from "~/users/user.server";

import { requesterHasPermissionToModifyUser } from "./protected.utils.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requesterHasPermissionToModifyUser({ request, params })

  invariant(params.userId, "userId not found");
  const targetUser = await getUserById(params.userId);
  invariant(targetUser, "user not found");

  const body = await request.json();
  invariant(body.password, "password not found");
  const { password } = body;

  await updateUserPassword(targetUser.id, password);
  return json({ success: true }, 204);
};

