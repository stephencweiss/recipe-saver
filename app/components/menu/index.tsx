import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import { Link } from "@remix-run/react";
import { useState } from "react";

import { useOptionalUser } from "~/utils";

import styles from "./styles.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

const menuItemClasses = `
select-none outline-none leading-none
rounded-[3px]
group
flex items-center
relative

text-xl
hover:bg-blue-500
hover:text-white
active:bg-blue-600
active:text-white
disabled:bg-gray-400
disabled:text-white
`;

export function HeaderNavMenu({ children }: React.PropsWithChildren<unknown>) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu.Root open={open} onOpenChange={() => setOpen(!open)}>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="menu"
          className="flex items-center gap-4
          stroke-white
          rounded
          px-4
          py-2
          transition-colors
          bg-slate-600
          text-blue-100
          hover:bg-blue-500
          active:bg-blue-600
          "
        >
          {children}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={"start"}
          side={"bottom"}
          className="DropdownMenuContent min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
          sideOffset={5}
          sticky="always"
          tabIndex={-1}
        >
          <DropdownMenu.Item className={menuItemClasses}>
            <Link className="w-full px-4 py-2" to="/recipes/explore">
              Explore
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClasses}>
            <Link className="w-full px-4 py-2" to="/recipes">
              Recipes
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClasses}>
            <Link className="w-full px-4 py-2" to="/feedback">
              Feedback
            </Link>
          </DropdownMenu.Item>
          <ProfileOrLoginMenuItem />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

const ProfileOrLoginMenuItem = () => {
  const user = useOptionalUser();
  const displayName = user?.username
  return (
    <DropdownMenu.Item className={menuItemClasses}>
      {displayName ? (
        <Link to={`/user/${user.id}/profile`} className="w-full px-4 py-2">
          {displayName}
        </Link>
      ) : (
        <Link to="/login" className="w-full px-4 py-2">
          Log In
        </Link>
      )}
    </DropdownMenu.Item>
  );
};

export function HamburgerNavMenu() {
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
          transition-colors
          bg-slate-600
          text-blue-100
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
          <DropdownMenu.Item className={menuItemClasses}>
            <Link className="w-full px-4 py-2" to="/recipes/explore">
              Explore
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClasses}>
            <Link className="w-full px-4 py-2" to="/recipes">
              Recipes
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item className={menuItemClasses}>
            <Link className="w-full px-4 py-2" to="/feedback">
              Feedback
            </Link>
          </DropdownMenu.Item>
          <ProfileOrLoginMenuItem />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
