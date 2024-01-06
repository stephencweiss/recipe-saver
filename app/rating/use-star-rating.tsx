import { StarIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import VisuallyHidden from "~/components/visually-hidden";

import { RatingType } from "./rating.server";

interface UseStarInteractive extends StarRatingBase {
  type: "interactive";
  associatedId: string;
  ratingType: RatingType;
}
interface UseStarReadOnly extends StarRatingBase {
  type: "view-only";
}
interface StarRatingBase {
  originalRating?: number | null;
}

type UseStarRatingArgs = UseStarInteractive | UseStarReadOnly;

/** A hook to facilitate star ratings throughout the app */
export const useStarRating = (args: UseStarRatingArgs) => {
  const { type, originalRating } = args;

  const [rating, setRating] = useState(originalRating ?? 0);
  const [hover, setHover] = useState(0);

  const interactive = type === "interactive";
  const width = "40px";
  const height = "40px";
  const fillColor = "rgb(37, 99, 235)";
  const strokeColor = "rgb(59, 130, 246)";

  const Component = interactive ? "button" : "div";

  const StarRatingUi = () => {
    return (
      <div className="flex flex-row">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;

          return (
            <Component
              key={index}
              className={`bg-transparent border-none ${
                interactive ? "cursor-pointer" : "cursor-default"
              }`}
              onMouseEnter={() => interactive && setHover(ratingValue)}
              onMouseLeave={() => interactive && setHover(0)}
              onClick={() => interactive && setRating(ratingValue)}
            >
              {ratingValue <= (hover || rating) ? (
                <StarFilledIcon
                  width={width}
                  height={height}
                  stroke={"hsl(216,91.5,58.6)"}
                  color={fillColor}
                />
              ) : (
                <StarIcon width={width} height={height} stroke={strokeColor} />
              )}
            </Component>
          );
        })}
        {interactive ? (
          <>
            <VisuallyHidden>
              rating:
              <input readOnly name="rating" value={rating} />
            </VisuallyHidden>
            <VisuallyHidden>
              associatedId:
              <input readOnly name="associated-id" value={args.associatedId} />
            </VisuallyHidden>
            <VisuallyHidden>
              ratingType:
              <input
                type="hidden"
                readOnly
                name="rating-type"
                value={args.ratingType}
              />
            </VisuallyHidden>
          </>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return { rating, StarRatingUi };
};
