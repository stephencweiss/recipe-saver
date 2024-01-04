import { ActionFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { getUserById } from "~/users/user.server";
import { requireJWT } from "~/utils/jwt.server";

/**
 * Helper function to validate that either:
 * 1. The requester is the user being modified
 * 2. The requester is an admin
 */
export async function requesterHasPermissionToModifyUser({
  request,
  params,
}: Pick<ActionFunctionArgs, "request" | "params">): Promise<void> {
  const jwtUser = requireJWT(request);
  invariant(params.userId, "userId not found");
  const targetUser = await getUserById(params.userId);
  invariant(targetUser, "user not found");
  const requestingUser = await getUserById(jwtUser.id);
  invariant(requestingUser, "requesting user not found");

  if (requestingUser.id !== targetUser.id && requestingUser.role !== "admin") {
    throw json({ error: "You are not authorized" }, { status: 401 });
  };
}
