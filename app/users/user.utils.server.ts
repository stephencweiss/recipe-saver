import { User } from "@prisma/client";

import { prisma } from "~/db.server";
import { isValidString } from "~/utils/strings";

export interface UpdatableUserError {
  errors: {
    global: string | null;
    username: string | null;
    email: string | null;
    phoneNumber: string | null;
  };
  status: number
}

export const createUserJSONErrorResponse = (
  errorKey: string,
  errorMessage: string,
  status = 400,
) => {
  const defaultErrors: UpdatableUserError["errors"] = {
    global: null,
    username: null,
    email: null,
    phoneNumber: null,
  };
  return ({ errors: { ...defaultErrors, [errorKey]: errorMessage }, status })
}

/**
 * On the User model, there are a few fields that *should* be unique, but we
 * cannot enforce all at the database level because some are also optional.
 *
 * These fields are:
 * - email (optional)
 * - phone (optional)
 * - username (required; enforced at the db level)
 *
 * This function checks to see if a user with the desired value for the field
 * already exists.
 * @param field
 * @param desiredValue
 * @returns
 */
export const isFieldValueIsAvailable = async (field: keyof User, desiredValue: string, id: User["id"]) => {
  // If the desired value is an empty string, then it is available - since this
  // is equivalent to "not set".
  if (!isValidString(desiredValue)) {
    return true;
  }
  const existingUser = await prisma.user.findFirst({
    where: {
      [field]: desiredValue,
      id: {
        not: id
      }
    },
  });

  // If no user found, then we know the field *is* available.
  return existingUser === null
}