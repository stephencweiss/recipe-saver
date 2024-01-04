import { User } from "@prisma/client";

import { prisma } from "~/db.server";
import { isValidString } from "~/utils/strings";

import { UpdatablePasswordError, UpdatableUserError } from "./user.types";

export const createUserJSONErrorResponse = (
  errorKey: string,
  errorMessage: string,
  status = 400,
): UpdatableUserError => {
  const defaultErrors: UpdatableUserError["errors"] = {
    global: null,
    username: null,
    email: null,
    phoneNumber: null,
  };
  return ({type: 'UpdatableUserError', errors: { ...defaultErrors, [errorKey]: errorMessage }, status })
}

export const createPasswordJSONErrorResponse = (
  errorKey: string,
  errorMessage: string,
  status = 400,
): UpdatablePasswordError => {
  const defaultErrors: UpdatablePasswordError["errors"] = {
    global: null,
    password: null,
  };
  return ({ type: 'UpdatablePasswordError', errors: { ...defaultErrors, [errorKey]: errorMessage }, status })
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