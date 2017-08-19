module.exports = mongoPool => {
  return {
    getVerses(query) {
      return mongoPool.collection(process.env.MONGODB_COLLECTION)
        .find(query)
        .toArray()
        .then(rows =>
          rows.map((row) => ({
            id: row._id,
            book: row.book_id,
            chapter: row.chapter,
            verse: row.verse,
            text: row.text
          })));
    },
    getText(query) {
      return mongoPool.collection(process.env.MONGODB_COLLECTION)
        .find(query)
        .toArray()
        .then(rows => rows.map(row => row.text).join(' '));
    },
  }
};