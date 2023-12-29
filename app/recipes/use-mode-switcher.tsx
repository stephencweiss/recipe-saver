import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useState } from "react";

import Tooltip from "../components/tooltip";

import { SubmissionStyles } from "./recipe-form-constants";

const toggleGroupItemClasses =
  "data-[state=on]:bg-slate-600  data-[state=on]:text-white  flex  items-center  justify-center  bg-white  text-slate-600  leading-4  first:rounded-l  last:rounded-r  focus:z-10  ";

export const useModeSwitcher = () => {
  const [mode, setMode] = useState<SubmissionStyles>("create-manual");

  const ModeUi = (
    <div className="flex flex-row gap-4">
      <div>
        <p className="text-l">
          Submission Mode
          <Tooltip message={"Choose the mode that's easiest for you!"} />
        </p>
      </div>

      <ToggleGroup.Root
        className="inline-flex rounded space-x-px"
        type="single"
        defaultValue="center"
        aria-label="Text alignment"
        value={mode}
        onValueChange={(value) => {
          if (value) setMode(value as SubmissionStyles);
        }}
      >
        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="create-manual"
          aria-label="Left aligned"
          // onClick={() => setMode("create-manual")}
        >
          <span className="px-4 py-2">Manual</span>
        </ToggleGroup.Item>

        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="create-from-url"
          aria-label="Right aligned"
          // onClick={() => setMode("create-from-url")}
        >
          <span className="px-4 py-2">URL</span>
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );

  return { mode, setMode, ModeUi };
};
