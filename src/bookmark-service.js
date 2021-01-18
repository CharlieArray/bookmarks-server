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
  addBookmark(knex, bookmark, book_id) {
    return knex("bookmarks")
    .insert(bookmark, book_id)
    .returning("*");
  },
  removeBookmark(knex, id) {
    return knex("bookmarks")
    .where("id", id)
    .del();
  },
};

module.exports = { BookMarksService };
