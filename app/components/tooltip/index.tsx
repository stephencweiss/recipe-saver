import { InfoCircledIcon } from "@radix-ui/react-icons";
import * as RadixTooltip from "@radix-ui/react-tooltip";

const Tooltip = ({ message }: { message: string }) => {
  return (
    <InvisibleTooltip message={message}>
          <button
            className="
          inline-flex
          h-[35px]
          w-[35px]
          items-center
          justify-center
          rounded-full
          bg-white
          hover:bg-blue-500
          active:bg-blue-600"
          >
            <InfoCircledIcon />
          </button>
    </InvisibleTooltip>
  );
};

export const InvisibleTooltip = ({
  children,
  message,
  displayMessage = true,
}: React.PropsWithChildren<{ message: string; displayMessage?: boolean }>) => {

  if (displayMessage == false) {
    return <>{children}</>;
  }
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={0}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="TooltipContent
            data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade
            data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade
            data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade
            data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade
            text-violet11
            select-none
            rounded-[4px]
            bg-white
            px-[15px]
            py-[10px]
            text-[15px]
            leading-none
            shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]
            will-change-[transform,opacity]"
            sideOffset={5}
          >
            {message}
            <RadixTooltip.Arrow className="fill-white" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
