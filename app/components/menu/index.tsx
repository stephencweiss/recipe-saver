import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import { Link } from "@remix-run/react";
import { useState } from "react";

import { useUser } from "~/utils";

import styles from "./styles.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export function Menu() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu.Root open={open} onOpenChange={() => setOpen(!open)}>
      <DropdownMenu.Trigger asChild>
        <button
          className="
          stroke-white
          rounded
          w-[44px]
          h-[44px]
          inline-flex
          items-center
          justify-center
          text-violet11
          bg-slate-600
          hover:bg-blue-500
          active:bg-blue-600
          "
          aria-label="menu"
        >
          <HamburgerMenuIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={"end"}
          className="DropdownMenuContent min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
          sideOffset={5}
          tabIndex={-1}
        >
          <DropdownMenu.Item
            className="
            group
            text-xl
            hover:bg-slate-600
            hover:text-blue-100
            leading-none
            rounded-[3px]
            flex
            items-center
            relative
            select-none
            outline-none
            data-[disabled]:text-mauve8
            data-[disabled]:pointer-events-none
            data-[highlighted]:bg-violet9
            data-[highlighted]:text-violet1"
          >
            <Link className="w-full px-4 py-2" to="/recipes">
              Recipes
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="
            group
            text-xl
            hover:bg-slate-600
            hover:text-blue-100
            leading-none
            rounded-[3px]
            flex
            items-center
            relative
            select-none
            outline-none
            data-[disabled]:text-mauve8
            data-[disabled]:pointer-events-none
            data-[highlighted]:bg-violet9
            data-[highlighted]:text-violet1"
          >
            <Link className="w-full px-4 py-2" to={`/user/${user.id}/profile`}>
              Profile
            </Link>
          </DropdownMenu.Item>

        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
