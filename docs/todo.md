# TODO

A quick scratch pad for things to do next (ignoring the Figma which is more of a master list).

Hopefully this will help me stay focused.

Collection

- [x] Update DB to have Collections - collections are generic things, owned by users.
They can be collections of anything.
What we're dealing with here are _recipe_ collections.
As such, the database has a join table for users, recipes, and collections.
A recipe should be able to be part of multiple collections for the same user.
- [x] When a user saves/uploads a recipe, it's automatically added to the default collection
- [ ] Add a "save to my collection"
- [x] Default to save to a "`<Username>`'s Main Collection" - this will allow extension later where the user will be able to select _which_ collection to save it to.
- [x] When a user signs up, we should automatically create a base collection


collections should be shareable with different rights -- this will come later.