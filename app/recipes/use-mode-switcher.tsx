import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";

import Tooltip from "../components/tooltip";

import { SubmissionStyles } from "./recipe-form-constants";

const toggleGroupItemClasses =
  "data-[state=on]:bg-slate-600 data-[state=on]:text-white flex items-center justify-center bg-white text-slate-600 leading-4 first:rounded-l last:rounded-r focus:z-10";

export const useModeSwitcher = (submissionStyle: SubmissionStyles) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<SubmissionStyles>(submissionStyle);
  const updateQueryParam = (param: string, value: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(param, value);
    navigate(`?${searchParams.toString()}`, { replace: true });
  };

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
          setMode(value as SubmissionStyles);
          updateQueryParam("submissionStyle", value);
        }}
      >
        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="create-manual"
          aria-label="Left aligned"
        >
          <span className="px-4 py-2">Manual</span>
        </ToggleGroup.Item>

        <ToggleGroup.Item
          className={toggleGroupItemClasses}
          value="create-from-url"
          aria-label="Right aligned"
        >
          <span className="px-4 py-2">URL</span>
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );

  return { ModeUi };
};
