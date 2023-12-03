interface IFormInput {
  defaultValue: string | undefined;
  name: string;
}

export interface FormTextProps extends IFormInput {
  error?: string | null;
  label?: string;
  placeholder?: string;
  ref?: React.RefObject<HTMLInputElement>;
  type?: string;
}

export interface FormTextAreaProps extends IFormInput {
  ref: React.RefObject<HTMLTextAreaElement>;
  rows?: number;
}
