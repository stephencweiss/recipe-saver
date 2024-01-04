# README

All routes within /api/protected *MUST* validate that the requesting user is authorized.
Authorization utils are available in protected.utils.ts.

Example of a protected route:

```ts
export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requesterHasPermissionToModifyUser({ request, params })

  // Complete protected action
};

```