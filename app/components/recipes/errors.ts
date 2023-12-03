import { json } from "@remix-run/node";

export const createJSONErrorResponse = (
  errorKey: string,
  errorMessage: string,
  status = 400,
) => {
  const defaultErrors = {
    global: null,
    title: null,
    source: null,
    sourceUrl: null,
    preparationSteps: null,
    ingredients: null,
  };
  return json(
    { errors: { ...defaultErrors, [errorKey]: errorMessage } },
    { status },
  );
};
