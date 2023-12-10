import { FormTextProps } from "./types";

export const FormTextInput = ({
  autofocus,
  defaultValue,
  error,
  label,
  name,
  placeholder,
  forwardRef,
  type,
}: FormTextProps) => (
  <div>
    {error ? (
      <div className="pt-1 text-red-700" id={`${name}-error`}>
        {error}
      </div>
    ) : null}
    <label className="flex w-full flex-col gap-2">
      <span>{label != null ? label : name.toUpperCase()}</span>
      <input
        name={name}
        // Want to autofocus **if** specified **and** the purpose of the page is the form
        // https://html.spec.whatwg.org/multipage/interaction.html#attr-fe-autofocus
        // https://brucelawson.co.uk/2009/the-accessibility-of-html-5-autofocus/
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autofocus}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
        ref={forwardRef}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? `${name}-error` : undefined}
      />
    </label>
  </div>
);
