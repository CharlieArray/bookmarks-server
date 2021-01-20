const BookMarksService = {
  getAllBookmarks(knex) {
    return knex
    .select("*")
    .from("bookmarks");
  },
  getById(knex, id) {
    return knex
    .from("bookmarks")
    .select("*")
    .where("id", id)
    .first();
  },
  addBookmark(knex, bookmark) {
    return knex("bookmarks")
    .insert(bookmark)
    .returning("*");
  },
  removeBookmark(knex, id) {
    return knex("bookmarks")
    .where("id", id)
    .del();
  },
  patchBookmark(knex, id, bookmark){
    return knex("bookmarks")
    .where("id", id)
    .update(bookmark)
  }
}
module.exports = { BookMarksService };
