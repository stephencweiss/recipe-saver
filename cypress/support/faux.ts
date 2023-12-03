// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node -r tsconfig-paths/register ./cypress/support/create-user.ts username@example.com,
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { installGlobals } from "@remix-run/node";

installGlobals();

async function createAndLogin(arg: string) {
  cy.log(`called the faux script with the arg: ${arg}`);
}

createAndLogin(process.argv[2]);
