# Recipe Saver

Based on the Indie Stack from Remix. More about [Remix Stacks](https://remix.run/stacks).

## What's in the stack

- [Fly app deployment](https://fly.io) with [Docker](https://www.docker.com/)
- Production-ready [SQLite Database](https://sqlite.org)
- Healthcheck endpoint for [Fly backups region fallbacks](https://fly.io/docs/reference/configuration/#services-http_checks)
- [GitHub Actions](https://github.com/features/actions) for deploy on merge to production and staging environments
- Email/Password Authentication with [cookie-based sessions](https://remix.run/utils/sessions#md-createcookiesessionstorage)
- Database ORM with [Prisma](https://prisma.io)
- Styling with [Tailwind](https://tailwindcss.com/)
- End-to-end testing with [Cypress](https://cypress.io)
- Local third party request mocking with [MSW](https://mswjs.io)
- Unit testing with [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com)
- Code formatting with [Prettier](https://prettier.io)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)

Not a fan of bits of the stack? Fork it, change it, and use `npx create-remix --template your/repo`! Make it your own.

## Quickstart

Click this button to create a [Gitpod](https://gitpod.io) workspace with the project set up and Fly pre-installed

[![Gitpod Ready-to-Code](https://img.shields.io/badge/Gitpod-Ready--to--Code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/remix-run/indie-stack/tree/main)

## Development

- Initial setup:

  ```sh
  npm run setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

The database seed script creates a new user with some data you can use to get started:

- Email: `rachel@remix.run`
- Password: `racheliscool`

### Relevant code

This project began as a simple note-taking app.
It's been repurposed for recipes and we'll continue to expand it over time.

Current functionality is creating users, logging in and out, and creating and deleting recipes.

- creating users, and logging in and out [./app/models/user.server.ts](./app/models/user.server.ts)
- user sessions, and verifying them [./app/session.server.ts](./app/session.server.ts)
- creating, and deleting recipes [./app/models/note.server.ts](./app/models/recipe.server.ts)

### Database

We're using a sqlite database
While this is not based on the epic-stack, that project has a good write up articulating their [decision to use sqlite](https://github.com/epicweb-dev/epic-stack/blob/main/docs/decisions/003-sqlite.md).

The ORM of Prisma manages most of the interface with the database.
Docs are [here](https://www.prisma.io/docs).

The [Prisma CLI reference is here](https://www.prisma.io/docs/orm/reference/prisma-cli-reference).

Prototyping changes: use `prisma db push`.

#### Connecting to the Database

Via the command line:

```shell
# sqlite3 <path-to-database>
% sqlite3 ./prisma/data.db
```

You can also connect the database to your favorite GUI, e.g., DBeaver

#### Working with Deployed Databases

**Update**: After all of my experimentation, @JacobParis pointed me to: [Connecting to your production database | Epic Stack](https://github.com/epicweb-dev/epic-stack/blob/main/docs/database.md#connecting-to-your-production-database) which rehashes a lot of what I'd learned about the sqlite3 CLI step, but also shows how to use Prisma Studio!

Since we're using a sqlite database and fly.io doesn't expose its databases to a public internet, we have several options:

1. Build an SSH tunnel and expose the proxy, then use Prisma Studio
1. Keep it old school, using `fly sftp`.
1. Access it via the sqlite3 CLI
1. Use something hosted and queryable, e.g., litefs and query ([example repo](https://github.com/gc-victor/query)) (I never actually got this working because, among other things, it would have required a hosted database)

##### SSH Tunnel & Prisma Studio

General instructions are [here](https://github.com/epicweb-dev/epic-stack/blob/main/docs/database.md#connecting-to-your-production-database), however, I found there were a few modifications necessary:

1. Connect to Prisma in one terminal.
   The instructions call for using `npm run db:studio`, however, that seems to require that prisma is installed globally.
   Using `npx` we get around that issue.

   ```shell
   fly ssh console -C "npx prisma studio" --app recipe-saver-0dec-staging
   Connecting to fdaa:0:6aff:a7b:8c31:370d:b9f6:2... complete
   Prisma schema loaded from prisma/schema.prisma
   Prisma Studio is up on http://localhost:5555
   ```

1. Create the Proxy between local port `5556` and the server's port `5555`.

   ```shell
   fly proxy 5556:5555 --app recipe-saver-0dec-staging
   Proxying local port 5556 to remote [recipe-saver-0dec-staging.internal]:5555
   ```

1. Visit Prisma Studio at `localhost:5556`.

##### SFTP Access

When would we use SFTP?

If we want to pull the database down to analyze it, this is probably our go to solution as we'll be able to easily plug it into DBeaver for a GUI experience.

We _are_ able to modify it too, though, since this involves a snapshot of data, there's the chance of data loss.

Pulling Data:

```shell
# fly sftp shell -a <app name>
% fly sftp shell -a recipe-saver-0dec-staging
fly sftp shell -a recipe-saver-0dec-staging
» cd data/
» get sqlite.db
get /data/sqlite.db -> sqlite.db
wrote 233472 bytes
```

This _gets_ the data down so that it can be easily analyzed in DBeaver.
Since it's just a file, create a new database connection in DBeaver that points to the file.
Et voila.

Pushing Data:

Getting the data back up onto the server is slightly more involved. It's a three step process:

1. Use SFTP to put a copy of the modified database back on the server

   ```shell
   # fly sftp shell -a <app name>
   % fly sftp shell -a recipe-saver-0dec-staging
   » put ./sqlite.db
   233472 bytes written
   ```

1. Use an SSH Console to replace the existing database

   ```shell
   # fly ssh console -a <app-name>
   % fly ssh console -a recipe-saver-0dec-staging
   Connecting to fdaa:0:6aff:a7b:8c31:370d:b9f6:2... complete
   root@3287353f470378:/myapp# cd ..
   root@3287353f470378:/# rm data/sqlite.db # as part of the deployment, we move the database to data/ from prisma/
   root@3287353f470378:/# mv sqlite.db data/sqlite.db # assumes that the put db file is in the root
   ```

1. Restart the application (in order to reestablish the database connection)

   ```shell
   # fly app restart <app-name>
   % fly app restart recipe-saver-0dec-staging
   ```

##### Shell Access

We can also use the same `sqlite3` CLI to access and interrogate the database on the server as we can locally.

```shell
# fly ssh console -a <app-name>
% fly ssh console -a recipe-saver-0dec-staging
Connecting to fdaa:0:6aff:a7b:8c31:370d:b9f6:2... complete
root@3287353f470378:/myapp# cd ..
root@3287353f470378:/# sqlite3 data/sqlite.db
root@3287353f470378:/# mv sqlite.db data/sqlite.db # assumes that the put db file is in the root
```

## Deployment

This Remix Stack comes with two GitHub Actions that handle automatically deploying your app to production and staging environments.

Prior to your first deployment, you'll need to do a few things:

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and log in to Fly

  ```sh
  fly auth signup
  ```

  > **Note:** If you have more than one Fly account, ensure that you are signed into the same account in the Fly CLI as you are in the browser. In your terminal, run `fly auth whoami` and ensure the email matches the Fly account signed into the browser.

- Create two apps on Fly, one for staging and one for production:

  ```sh
  fly apps create recipe-saver-0dec
  fly apps create recipe-saver-0dec-staging
  ```

  > **Note:** Make sure this name matches the `app` set in your `fly.toml` file. Otherwise, you will not be able to deploy.

  - Initialize Git.

  ```sh
  git init
  ```

- Create a new [GitHub Repository](https://repo.new), and then add it as the remote for your project. **Do not push your app yet!**

  ```sh
  git remote add origin <ORIGIN_URL>
  ```

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user settings on Fly and create a new [token](https://web.fly.io/user/personal_access_tokens/new), then add it to [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`.

- Add a `SESSION_SECRET` to your fly app secrets, to do this you can run the following commands:

  ```sh
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app recipe-saver-0dec
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app recipe-saver-0dec-staging
  ```

  If you don't have openssl installed, you can also use [1Password](https://1password.com/password-generator) to generate a random secret, just replace `$(openssl rand -hex 32)` with the generated secret.

- Create a persistent volume for the sqlite database for both your staging and production environments. Run the following:

  ```sh
  fly volumes create data --size 1 --app recipe-saver-0dec
  fly volumes create data --size 1 --app recipe-saver-0dec-staging
  ```

Now that everything is set up you can commit and push your changes to your repo. Every commit to your `main` branch will trigger a deployment to your production environment, and every commit to your `dev` branch will trigger a deployment to your staging environment.

### Connecting to your database

The sqlite database lives at `/data/sqlite.db` in your deployed application. You can connect to the live database by running `fly ssh console -C database-cli`.

### Getting Help with Deployment

If you run into any issues deploying to Fly, make sure you've followed all of the steps above and if you have, then post as many details about your deployment (including your app name) to [the Fly support community](https://community.fly.io). They're normally pretty responsive over there and hopefully can help resolve any of your deployment issues and questions.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to production after running tests/build/etc. Anything in the `dev` branch will be deployed to staging.

## Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Cypress client. Make sure the database is running in docker as described above.

We have a utility for testing authenticated features without having to go through the login flow:

```ts
cy.login();
// you are now logged in as a new user
```

We also have a utility to auto-delete the user at the end of your test. Just make sure to add this in each test file:

```ts
afterEach(() => {
  cy.cleanupUser();
});
```

That way, we can keep your local db clean and keep your tests isolated from one another.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.
