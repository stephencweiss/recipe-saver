export const SUPPORTED_SUBMISSION_STYLES = [
  "create-manual", // Only on the new page
  "edit", // Only on the edit page
] as const;

export type SubmissionStyles = (typeof SUPPORTED_SUBMISSION_STYLES)[number];
