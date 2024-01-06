import { type User } from "@prisma/client";
import invariant from "tiny-invariant";

import { getRecipeRatings, getUserRecipeRating, submitRecipeRating } from "~/recipes/recipe.server";

export type RatingType = "recipe";
export const isValidRatingType = (ratingType: string): ratingType is RatingType => {
  return ratingType === "recipe";
}

/**
 * Submit a rating for any type of rating;
 * User is optional
 */
export async function submitRating({
  associatedId,
  userId,
  ratingType,
  rating,
}: {
  associatedId: string;
  ratingType: RatingType;
  userId?: User["id"];
  rating: number;
}) {
  switch (ratingType) {
    case "recipe": {
      invariant(associatedId, "Must provide a recipeId to submit a recipe rating")
      return await submitRecipeRating({ recipeId: associatedId, userId, rating });
    }
    default:
      throw new Error(`Unsupported rating type: ${ratingType}`);
  }
}

/** Get all ratings associated with a specific type of record, e.g., recipes */
export async function getRatings({
  associatedId,
  ratingType,
}: {
  associatedId: string;
  ratingType: RatingType;
}) {
  switch (ratingType) {
    case "recipe": {
      return await getRecipeRatings({ recipeId: associatedId });
    }
    default:
      throw new Error(`Unsupported rating type: ${ratingType}`);
  }
};

/** Get all ratings associated with a specific type of record submitted by a user, e.g., recipes */
export async function getUserRatingsForAssociatedId({
  associatedId,
  ratingType,
  userId,
}: {
  associatedId: string;
  ratingType: RatingType;
  userId?: User["id"];
}) {
  switch (ratingType) {
    case "recipe": {
      return await getUserRecipeRating({ recipeId: associatedId, userId });
    }
    default:
      throw new Error(`Unsupported rating type: ${ratingType}`);
  }
}

