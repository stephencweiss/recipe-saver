import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

import { useOptionalUser } from "~/utils";

export const meta: MetaFunction = () => [{ title: "Remix Notes" }];

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1615937722923-67f6deaf2cc9?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Grilled Meat on Black Pan by Maddie Hilton -https://unsplash.com/@mham3816. https://unsplash.com/photos/grilled-meat-on-black-pan-Q9yr-cvJr30?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
              />
              <div className="absolute inset-0 bg-[color:rgb(247, 242, 145)] mix-blend-multiply" />
            </div>
            <div className="relative px-4 pb-8 pt-16 sm:px-6 sm:pb-14 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-32">
              <h1 className="text-center text-6xl font-extrabold tracking-tight sm:text-8xl lg:text-9xl">
                <span className="block uppercase text-yellow-500 drop-shadow-md">
                  Morsels & Memories
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-center text-xl bg-white text-yellow-500 rounded border-2 p-5 text-base sm:max-w-3xl">
                Find your next favorite recipe or share one of your own. Make a
                menu and plan your next party. Keep a journal of your favorite
                meals and the memories they bring.
              </p>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                {user ? (
                  <Link
                    to="/recipes"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                  >
                    View Recipes for {user.username ?? user.email}
                  </Link>
                ) : (
                  <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                    <Link
                      to="/join"
                      className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
                    >
                      Sign up
                    </Link>
                    <Link
                      to="/login"
                      className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
                    >
                      Log In
                    </Link>
                  </div>
                )}
              </div>
              <h2 className="pt-16 text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                <span className="block uppercase text-yellow-500 drop-shadow-md">
                  Eat well. Make memories.
                </span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
