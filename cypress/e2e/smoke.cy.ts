import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };

    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /sign up/i }).click();

    cy.findByRole("textbox", { name: /email/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByRole("link", { name: /recipes/i }).click();
    cy.findByRole("button", { name: /logout/i }).click();
    cy.findByRole("link", { name: /log in/i });
  });

  it("should allow you to make, edit, and delete a recipes", () => {
    const testNote = {
      title: faker.lorem.words(1),
      description: faker.lorem.sentences(1),
      preparationSteps: faker.lorem.sentences(1),
      updatedTitle: faker.lorem.words(1),
    };
    cy.login();

    cy.visitAndCheck("/");

    cy.findByRole("link", { name: /recipes/i }).click();
    cy.findByText("No recipes yet");

    cy.findByRole("link", { name: /\+ new recipe/i }).click();

    cy.findByRole("textbox", { name: /title/i }).type(testNote.title);
    cy.findByRole("textbox", { name: /description/i }).type(testNote.description);
    cy.findByPlaceholderText(/describe the step/i).type(testNote.preparationSteps);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findAllByRole("link").contains(testNote.title).click();

    cy.findByRole("button", { name: /edit/i }).click();
    cy.findByRole("textbox", { name: /title/i }).type(testNote.updatedTitle);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findAllByRole("link").contains(testNote.updatedTitle).click();

    cy.findByRole("button", { name: /delete/i }).click();
    cy.findByText("No recipes yet");
  });

  // it('calls the faux script', () => {
  //   cy.faux();
  // });
  // it("should intentionally fail", () => {
  //   cy.login();
  //   cy.visitAndCheck("/a-path-that-does-not-exist");
  // })
});
