import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createEmailUser() {
  const email = "rachel@remix.run";
  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });
  const hashedPassword = await bcrypt.hash("racheliscool", 10);
  const user = await prisma.user.create({
    data: {
      username: email,
      email,
      password: {
        create: {
          encryptedPassword: hashedPassword,
        },
      },
    },
  });
  return user;
}

async function createEmailUserTwo() {
  const email = "kate@remix.run";
  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });
  const hashedPassword = await bcrypt.hash("katerox", 10);
  const user = await prisma.user.create({
    data: {
      username: email,
      email,
      password: {
        create: {
          encryptedPassword: hashedPassword,
        },
      },
    },
  });
  return user;
}

async function createPumpkinPieRecipe(submitter: { id: string }) {
  const title = "Pumpkin Pie";
  const pieIngredientsObj = [
    {
      name: "pumpkin puree",
      quantity: 15,
      unit: "oz",
    },
    {
      name: "sweetened condensed milk",
      quantity: 14,
      unit: "oz",
    },
    {
      name: "eggs",
      quantity: 2,
      unit: "",
    },
    {
      name: "pumpkin pie spice",
      quantity: 1,
      unit: "tbsp",
    },
    {
      name: "pie crust",
      quantity: 1,
      unit: "",
    },
  ];
  const pieIngredientNames = pieIngredientsObj.map(
    (ingredient) => ingredient.name,
  );
  const pieIngredients = await Promise.all(
    pieIngredientNames.map(async (name) => {
      const ingredient = await prisma.ingredient.findUnique({
        where: { name },
      });
      if (ingredient) {
        return ingredient;
      }
      return await prisma.ingredient.create({ data: { name } });
    }),
  );
  const pieTagNames = ["pumpkin", "pie", "dessert", "thanksgiving"];
  const pieTags = await Promise.all(
    pieTagNames.map(async (name) => {
      const tag = await prisma.tag.findUnique({ where: { name } });
      if (tag) {
        return tag;
      }
      return await prisma.tag.create({ data: { name } });
    }),
  );
  // cleanup the existing database
  await prisma.recipe.deleteMany({ where: { title } }).catch(() => {
    /*no worries if it doesn't exist yet*/
  });
  const pieRecipe = await prisma.recipe.create({
    data: {
      title,
      description: "A delicious pumpkin pie recipe",
      preparationSteps:
        '["Preheat oven to 425 F.","Whisk pumpkin, sweetened condensed milk, eggs, spices and salt in medium bowl until smooth.","Pour into crust. Bake 15 minutes.","Reduce oven temperature to 350 F and continue baking 35 to 40 minutes or until knife inserted 1 inch from crust comes out clean.","Cool. Garnish as desired. Store leftovers covered in refrigerator."]',
      source: "NYTimes Cooking",
      sourceUrl: "https://cooking.nytimes.com/recipes/1015622-pumpkin-pie",
      submittedBy: submitter.id,
    },
  });
  await Promise.all(
    pieTags.map((tag) => {
      return prisma.recipeTag.create({
        data: {
          recipeId: pieRecipe.id,
          tagId: tag.id,
        },
      });
    }),
  );
  await Promise.all(
    pieIngredients.map((ingredient) => {
      const ingredientObj = pieIngredientsObj.find(
        (obj) => obj.name === ingredient.name,
      );
      return prisma.recipeIngredient.create({
        data: {
          recipeId: pieRecipe.id,
          ingredientId: ingredient.id,
          quantity: ingredientObj?.quantity ?? null,
          unit: ingredientObj?.unit ?? null,
        },
      });
    }),
  );
}

async function createCaesarSaladRecipe(submitter: { id: string }) {
  const title = "Caesar Salad";
  const saladIngredientsObj = [
    {
      name: "romaine lettuce",
      quantity: 1,
      unit: "head",
    },
    {
      name: "croutons",
      quantity: 1,
      unit: "cup",
    },
    {
      name: "parmesan cheese",
      quantity: 1,
      unit: "cup",
    },
    {
      name: "lemon juice",
      quantity: 1,
      unit: "tbsp",
    },
    {
      name: "olive oil",
      quantity: 1,
      unit: "tbsp",
    },
    {
      name: "garlic",
      quantity: 1,
      unit: "clove",
    },
    {
      name: "salt",
      quantity: 1,
      unit: "tsp",
    },
    {
      name: "pepper",
      quantity: 1,
      unit: "tsp",
    },
    {
      name: "egg yolk",
      quantity: 1,
      unit: "",
    },
    {
      name: "dijon mustard",
      quantity: 1,
      unit: "tsp",
    },
    {
      name: "anchovy paste",
      quantity: 1,
      unit: "tsp",
    },
  ];
  const saladIngredientNames = saladIngredientsObj.map(
    (ingredient) => ingredient.name,
  );
  const saladIngredients = await Promise.all(
    saladIngredientNames.map(async (name) => {
      const ingredient = await prisma.ingredient.findUnique({
        where: { name },
      });
      if (ingredient) {
        return ingredient;
      }
      return await prisma.ingredient.create({ data: { name } });
    }),
  );
  const saladTagNames = ["salad", "dinner", "lunch", "vegetarian"];
  const saladTags = await Promise.all(
    saladTagNames.map(async (name) => {
      const tag = await prisma.tag.findUnique({ where: { name } });
      if (tag) {
        return tag;
      }
      return await prisma.tag.create({ data: { name } });
    }),
  );
  // cleanup the existing database
  await prisma.recipe.deleteMany({ where: { title } }).catch(() => {
    /*no worries if it doesn't exist yet*/
  });
  const saladRecipe = await prisma.recipe.create({
    data: {
      title,
      description: "A delicious caesar salad recipe",
      preparationSteps:
        '["In a large wooden salad bowl, rub the inside with the garlic clove, then discard. Add the lettuce, croutons, and cheese. Set aside.","In a small bowl, whisk together the lemon juice, olive oil, salt, pepper, egg yolk, mustard, and anchovy paste. Pour over the lettuce in the salad bowl, and toss well.","Serve immediately."]',
      source: "NYTimes Cooking",
      sourceUrl: "https://cooking.nytimes.com/recipes/1017937-caesar-salad",
      submittedBy: submitter.id,
    },
  });
  await Promise.all(
    saladTags.map((tag) => {
      return prisma.recipeTag.create({
        data: {
          recipeId: saladRecipe.id,
          tagId: tag.id,
        },
      });
    }),
  );
  await Promise.all(
    saladIngredients.map((ingredient) => {
      const ingredientObj = saladIngredientsObj.find(
        (obj) => obj.name === ingredient.name,
      );
      return prisma.recipeIngredient.create({
        data: {
          recipeId: saladRecipe.id,
          ingredientId: ingredient.id,
          quantity: ingredientObj?.quantity ?? null,
          unit: ingredientObj?.unit ?? null,
        },
      });
    }),
  );
}

/** Useful if we need to start fresh, but most of the time, this can be left off */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function wipeSeededDatabase() {
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipeTag.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.user.deleteMany({});
}

async function seed() {
  // await wipeDatabase();
  const userOne = await createEmailUser();
  const userTwo = await createEmailUserTwo();

  await createPumpkinPieRecipe(userOne);
  await createCaesarSaladRecipe(userTwo);

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
