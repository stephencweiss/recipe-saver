interface IFormInput {
  defaultValue: string | undefined;
  name: string;
}

export interface FormTextProps extends IFormInput {
  autofocus?: boolean;
  error?: string | null;
  label?: string;
  placeholder?: string;
  forwardRef?: React.RefObject<HTMLInputElement>;
  type?: string;
}

export interface FormTextAreaProps extends IFormInput {
  forwardRef: React.RefObject<HTMLTextAreaElement>;
  rows?: number;
}
