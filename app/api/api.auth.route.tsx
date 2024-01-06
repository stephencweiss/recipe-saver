/** An API route that will take basic auth creds in the body of a request
 * Based on those creds, it will return a JWT
 *
 * Before returning the JWT, it will check to see if the user exists
 * and if the password it supplied is correct.
 *
 * If the user exists and the password is correct, it will return a JWT
 * the JWT will be valid for 1 hour
 */
import { ActionFunctionArgs, json } from "@remix-run/node";

import { verifyEmailLogin, verifyUsernameLogin } from "~/users/user.server";
import { createJWT } from "~/utils/jwt.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.json()
  const method = String(body.method);
  switch (request.method) {
    case "POST": {
      switch (method) {
        case "email": {
          const email = String(body.email);
          const password = String(body.password);
          const user = await verifyEmailLogin(email, password);
          if (!user) {
            return json(
              { error: "Invalid email or password" },
              { status: 401 },
            );
          }
          console.log(JSON.stringify(user, null, 2))
          const jwt = await createJWT(user);
          return json({ access_token: jwt, token_type: "bearer" });
        }
        case "username": {
          const username = String(body.username);
          const password = String(body.password);
          const user = await verifyUsernameLogin(username, password);
          if (!user) {
            return json(
              { error: "Invalid username or password" },
              { status: 401 },
            );
          }

          const jwt = await createJWT(user);
          return json({ jwt });
        }

        default:
          return json({ error: "Invalid method" }, { status: 401 });
      }
    }
    default: {
      return json({ error: "Method not allowed" }, { status: 405 });
    }
  }
};