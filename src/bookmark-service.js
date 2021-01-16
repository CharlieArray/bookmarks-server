const BookMarksService = {
    getAllBookmarks(knex){
        return knex
          .from('bookmarks')
          .select('*')
    },
    getById(knex, id){
        return knex
          .from('bookmarks')
          .select('*')
          .where('id', id)
          .first();
    }

}

module.exports = BookMarksService
