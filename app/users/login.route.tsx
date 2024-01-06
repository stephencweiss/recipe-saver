import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  TypedResponse,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { useEffect, useRef } from "react";

import VisuallyHidden from "~/components/visually-hidden";
import { createUserSession, getUserId } from "~/session.server";
import {
  User,
  verifyEmailLogin,
  verifyUsernameLogin,
} from "~/users/user.server";
import { safeRedirect } from "~/utils";
import { isValidString } from "~/utils/strings";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const loginMode = String(formData.get("mode"));
  const email = String(formData.get("email"));
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = String(formData.get("remember"));

  const loginHandler = await handleLogin(redirectTo, request, remember);
  if (!isValidString(password)) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  switch (loginMode) {
    case "email": {
      return await handleEmailLogin(email, password, loginHandler);
    }
    case "username": {
      return await handleUsernameLogin(username, password, loginHandler);
    }
    default:
      throw new Response(`Unsupported login type: ${loginMode}`, {
        status: 400,
      });
  }
};

const createLoginError = (
  message: string,
  field?: keyof LoginError["errors"],
  status?: number,
): LoginError => {
  return {
    errors: {
      global: null,
      email: null,
      username: null,
      password: null,
      [field ?? "global"]: message,
    },
    status: status ?? 400,
  };
};

const handleEmailLogin = async (
  email: string,
  password: string,
  loginHandler: (userId: User["id"]) => Promise<TypedResponse<never>>,
): Promise<TypedResponse<never | LoginError>> => {
  if (!isValidString(email)) {
    return json(createLoginError("Email is required", "email"));
  }

  const user = await verifyEmailLogin(email, password);

  if (!user) {
    return json(createLoginError("Unable to login"));
  }

  return loginHandler(user.id);
};

interface LoginError {
  errors: {
    global: string | null;
    email: string | null;
    username: string | null;
    password: string | null;
  };
  status: number;
}

const isLoginErrorResponse = (response: unknown): response is LoginError => {
  return (
    typeof response === "object" &&
    response !== null &&
    "errors" in response &&
    "status" in response
  );
};

const handleUsernameLogin = async (
  username: string,
  password: string,
  loginHandler: (userId: User["id"]) => Promise<TypedResponse<never>>,
): Promise<unknown | TypedResponse<LoginError>> => {
  if (!isValidString(username)) {
    return json(createLoginError("Username is required", "username"));
  }

  const user = await verifyUsernameLogin(username, password);

  if (!user) {
    return json(createLoginError("Unable to login"));
  }
  return loginHandler(user.id);
};

const handleLogin =
  async (redirectTo: string, request: Request, remember: string) =>
  async (userId: User["id"]): Promise<TypedResponse<never>> => {
    return createUserSession({
      redirectTo,
      remember: remember === "on" ? true : false,
      request,
      userId: userId,
    });
  };

export const meta: MetaFunction = () => [{ title: "Login" }];

type SupportedLoginMode = "email" | "username";
const isSupportedLoginMode = (value: string): value is SupportedLoginMode => {
  return value === "email" || value === "username";
};

const useLoginModeSwitcher = () => {
  const [searchParams] = useSearchParams();
  const searchMode = searchParams.get("mode") ?? "";
  const mode: SupportedLoginMode = isSupportedLoginMode(searchMode)
    ? (searchMode as SupportedLoginMode)
    : "username";

  const navigate = useNavigate();
  const updateQueryParam = (param: string, value: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(param, value);
    navigate(`?${searchParams.toString()}`, { replace: true });
  };

  const switchToEmail = () => {
    updateQueryParam("mode", "email");
  };

  const switchToUsername = () => {
    updateQueryParam("mode", "username");
  };

  return {
    currentMode: mode,
    switchToEmail,
    switchToUsername,
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/recipes";
  const actionData = useActionData<typeof action>();
  const errors = isLoginErrorResponse(actionData) ? actionData.errors : null;
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const { currentMode, switchToEmail, switchToUsername } =
    useLoginModeSwitcher();

  // TODO: figure out how i want to handle this since right now i'm thinking of only returning global errors
  useEffect(() => {
    if (errors?.email) {
      emailRef.current?.focus();
    } else if (errors?.username) {
      usernameRef.current?.focus();
    } else if (errors?.password) {
      passwordRef.current?.focus();
    }
  }, [errors]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6">
          <VisuallyHidden>
            <input name="mode" value={currentMode} />
          </VisuallyHidden>
          {errors?.global ? (
            <div className="pt-1 text-red-700" id="global-error">
              {errors.global}
            </div>
          ) : null}
          {currentMode == "username" ? (
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  ref={usernameRef}
                  id="username"
                  required
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  name="username"
                  type="username"
                  autoComplete="username"
                  aria-invalid={errors?.username ? true : undefined}
                  aria-describedby="username-error"
                  className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                />
                {errors?.username ? (
                  <div className="pt-1 text-red-700" id="username-error">
                    {errors.username}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <></>
          )}
          {currentMode == "email" ? (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  ref={emailRef}
                  id="email"
                  required
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus={true}
                  name="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={errors?.email ? true : undefined}
                  aria-describedby="email-error"
                  className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                />
                {errors?.email ? (
                  <div className="pt-1 text-red-700" id="email-error">
                    {errors.email}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <></>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors?.password ? true : undefined}
                aria-describedby="password-error"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
              />
              {errors?.password ? (
                <div className="pt-1 text-red-700" id="password-error">
                  {errors.password}
                </div>
              ) : null}
            </div>
          </div>

          <VisuallyHidden>
            <input name="redirectTo" value={redirectTo} />
          </VisuallyHidden>
          <button
            type="submit"
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <div className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                className="text-blue-500 underline"
                to={{
                  pathname: "/join",
                  search: searchParams.toString(),
                }}
              >
                Sign up
              </Link>
            </div>
          </div>
          <div className="flex w-full">
            {currentMode !== "email" ? (
              <button
                onClick={switchToEmail}
                className="text-center text-sm text-gray-500"
              >
                Login with{" "}
                <span className="text-blue-500 underline">Email</span>
              </button>
            ) : (
              <></>
            )}
            {currentMode !== "username" ? (
              <button
                onClick={switchToUsername}
                className="text-center text-sm text-gray-500"
              >
                Login with{" "}
                <span className="text-blue-500 underline">Username</span>
              </button>
            ) : (
              <></>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}
