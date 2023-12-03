import { FormTextProps } from "./types";

export const FormTextInput = ({
  ref,
  error,
  defaultValue,
  name,
  placeholder,
  type,
}: FormTextProps) => (
  <div>
    {error ? (
      <div className="pt-1 text-red-700" id={`${name}-error`}>
        {error}
      </div>
    ) : null}
    <label className="flex w-full flex-col gap-2">
      <span>{name.toUpperCase()}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? `${name}-error` : undefined}
      />
    </label>
  </div>
);