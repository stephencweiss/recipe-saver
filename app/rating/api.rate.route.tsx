import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";

import VisuallyHidden from "~/components/visually-hidden";
import { getUserId } from "~/session.server";

import { RatingType, submitRating } from "./rating.server";

export function action(args: ActionFunctionArgs) {
  const { request } = args;
  switch (request.method) {
    case "POST": {
      return handleRecipeRating(args);
    }
  }
}

async function handleRecipeRating(args: ActionFunctionArgs) {
  const { request } = args;
  const formData = await request.formData();
  const redirectTo = String(formData.get("redirect-to"));
  const associatedId = String(formData.get("associated-id"));
  const userId = await getUserId(request);
  const rating = Number(formData.get("rating"));

  await submitRating({
    associatedId,
    userId,
    rating,
    ratingType: "recipe",
  });

  if (redirectTo) {
    return redirect(redirectTo);
  }
  return json({ success: true });
}

interface StarRatingProps {
  associatedId: string;
  ratingType: RatingType;
  originalRating?: number | null;
  redirectTo?: string;
}

export const StarRating = (args: StarRatingProps) => {
  const { originalRating, associatedId, ratingType, redirectTo } = args;
  const [rating, setRating] = useState(originalRating ?? 0);
  const rateFetcher = useFetcher({ key: "rate-fetcher" });
  const width = "40px";
  const height = "40px";
  const fillColor = "rgb(37, 99, 235)";
  const strokeColor = "rgb(59, 130, 246)";

  return (
    <rateFetcher.Form
      method="post"
      action="/api/rate"
      className="flex flex-row"
    >
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;

        return (
          <button
            type="submit"
            name="action"
            onMouseEnter={() => setRating(ratingValue)}
            onMouseLeave={() => setRating(originalRating ?? 0)}
            value="rate-recipe"
            key={index}
            className="bg-transparent border-none cursor-pointer"
          >
            {ratingValue <= rating ? (
              <StarFilledIcon
                width={width}
                height={height}
                stroke={"hsl(216,91.5,58.6)"}
                color={fillColor}
              />
            ) : (
              <StarIcon width={width} height={height} stroke={strokeColor} />
            )}
          </button>
        );
      })}

      <>
        <VisuallyHidden>
          rating:
          <input readOnly name="rating" value={rating} />
        </VisuallyHidden>
        <VisuallyHidden>
          associatedId:
          <input readOnly name="associated-id" value={associatedId} />
        </VisuallyHidden>
        <VisuallyHidden>
          Redirect:
          <input readOnly name="redirect-to" value={redirectTo} />
        </VisuallyHidden>
        <VisuallyHidden>
          ratingType:
          <input type="hidden" readOnly name="rating-type" value={ratingType} />
        </VisuallyHidden>
      </>
    </rateFetcher.Form>
  );
};
