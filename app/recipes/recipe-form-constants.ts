export const SUPPORTED_SUBMISSION_STYLES = [
  "create-manual", // Only on the new page
  "create-from-url", // only on the url submit page
  "edit", // Only on the edit page
] as const;

export type SubmissionStyles = (typeof SUPPORTED_SUBMISSION_STYLES)[number];
