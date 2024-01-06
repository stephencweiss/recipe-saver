import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";

export const Checklist = ({
  items,
}: {
  items: (string | React.ReactNode)[];
}) => {
  return (
    <div className="flex-col">
      {items.map((item, index) => (
        <Checkbox
          item={item}
          id={`${item}-${index}`}
          key={`${item}-${index}`}
        />
      ))}
    </div>
  );
};

const Checkbox = ({
  item,
  id,
}: {
  item: string | React.ReactNode;
  id: string;
}) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex py-2">
      <RadixCheckbox.Root
        onClick={() => setChecked(!checked)}
        checked={checked}
        className="flex flex-shrink-0 h-[25px] w-[25px] appearance-none items-center justify-center rounded bg-white border outline-none focus:shadow-[0_0_0_2px_black]"
        id={id.toString()}
      >
        <RadixCheckbox.Indicator>
          {checked === true ? <CheckIcon /> : null}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>

      <label
        className='pl-[15px] text-xl sm:text-lg'
        htmlFor={id.toString()}
      >
        <button
        className={`${checked ? "line-through" : ""} text-left`}
          onClick={() => setChecked(!checked)}
        >
          {item}
        </button>
      </label>
    </div>
  );
};
