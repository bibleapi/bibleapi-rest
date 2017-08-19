import _ from 'lodash';
import { bcv_parser as BcvParcer } from 'bible-passage-reference-parser/js/en_bcv_parser';

const mapQuery = (passages) => {
  const bcv = new BcvParcer;
  const translationInfo = bcv.translation_info('');

  const queries = _.map(passages, (passage) => {

    if(passage.type === 'bc') { // Gen 1
      return { book_id: passage.start.b, chapter: passage.start.c }
    }
    else if(passage.type === 'bcv') { // Gen 1:4
      return { book_id: passage.start.b, chapter: passage.start.c, verse: passage.start.v }
    }
    else if(passage.type === 'cv') { // Gen 1:4,6:9
      return { book_id: passage.start.b, chapter: passage.start.c, verse: passage.start.v }
    }
    else if(passage.type === 'range') {
      // multiple books in one passage
      if (passage.start.b != passage.end.b) {
        console.error('One passages cannot contain multiple books!');
        return null;
      }
      // multiple chapters of one book
      else if(passage.end.c - passage.start.c > 0) {
        const chapters = _.range(passage.start.c, passage.end.c + 1);
        const queries = _.map(chapters, (chapter) => {
          let startVerse = 1;
          let endVerse = translationInfo.chapters[passage.start.b][chapter-1];

          if (chapters[0] === chapter) {
            startVerse = passage.start.v;
          }
          if (chapters[_.size(chapters)-1] === chapter) {
            endVerse = passage.end.v;
          }
          return { book_id: passage.start.b, chapter, verse: {$gte: startVerse, $lte: endVerse} }
        });
        return {$or: queries};
      }
      // one chapter passage
      else if(passage.start.c === passage.end.c) {
        return {
          book_id: passage.start.b,
          chapter: passage.start.c,
          verse: {$gte: passage.start.v, $lte: passage.end.v}
        };
      }

    }

  });

  return { $and: queries };
};

export default { mapQuery }