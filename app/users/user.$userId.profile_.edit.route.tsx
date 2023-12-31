import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useActionData, Form, useLoaderData } from "@remix-run/react";

import { FormTextInput } from "~/components/forms";
import { requireUserId } from "~/session.server";

import { User, getUserById, updateUser } from "./user.server";
import { UpdatableUserError } from "./user.utils.server";

export const loader = async ({ params }: ActionFunctionArgs) => {
  const userId = params.userId;
  const user = await getUserById(userId ?? "");
  return json({ user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return await handleUserProfileAction(request);
};

const handleUserProfileAction = async (request: Request) => {
  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "update-profile": {
      const submittingUser = await requireUserId(request);
      const partialUser = {
        username: String(formData.get("username")),
        email: String(formData.get("email")),
        phoneNumber: String(formData.get("phoneNumber")),
        id: String(formData.get("userId")),
      };

      const updatedUser = await updateUser(partialUser, submittingUser);
      if (isErrorResponse(updatedUser)) {
        return json(updatedUser, { status: 400 });
      }
      return redirect(`/user/${updatedUser.id}/profile`);

    }
    case "default":
      throw new Response(`Unsupported action: ${action}`, { status: 400 });
  }
};

const isErrorResponse = (actionData?: Pick<User, "id"> | UpdatableUserError): actionData is UpdatableUserError => {
  return ((actionData ?? {}) as UpdatableUserError).errors !== undefined;
}

export default function UserProfileEdit() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  const data = useLoaderData<typeof loader>();
  const { user } = data;

  return (
    <Form method="post">
      <button type="submit">Save</button>
      <input type="hidden" name="action" value="update-profile" />
      <input type="hidden" name="userId" value={user?.id} />
      <input
        type="hidden"
        name="redirectTo"
        value={`/user/${user?.id}/profile`}
      />
      <FormTextInput
        error={errors?.username}
        label="Username"
        name="username"
        defaultValue={user?.username ?? ""}
      />
      <FormTextInput
        label="Email"
        name="email"
        defaultValue={user?.email ?? ""}
        error={errors?.email}
      />
      <FormTextInput
        label="Phone Number"
        name="phoneNumber"
        defaultValue={user?.phoneNumber ?? ""}
        error={errors?.phoneNumber}
      />
    </Form>
  );
}
