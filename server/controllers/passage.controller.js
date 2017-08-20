import mongoDb from '../db/mongo';
import parser from '../parser/parser';
import queryMapper from '../db/queryMapper';
import BaseController from './base.controller';

class PassageController extends BaseController {

  find = async (req, res, next) => {
    try {
      const reference = req.params.reference;
      const parsedReference = parser.parse(reference);
      const passageQuery = queryMapper.mapQuery(parsedReference);
      const result = await mongoDb(req.app.mongoPool).getVerses(passageQuery);
      res.json(
        {
          verses: result
        }
      );
    } catch(err) {
      next(err);
    }
  };

  findRandomProverb = async (req, res, next) => {
    try {
      const randomChapter = Math.floor(Math.random() * 30) + 1;
      const randomVerse = Math.floor(Math.random() * 20) + 1;
      const reference = ['Prov ', randomChapter, ':', randomVerse].join('');
      console.log(reference);
      const parsedReference = parser.parse(reference);
      const passageQuery = queryMapper.mapQuery(parsedReference);
      const result = await mongoDb(req.app.mongoPool).getVerses(passageQuery);
      res.json(
        {
          verses: result
        }
      );
    } catch(err) {
      next(err);
    }
  };

}

export default new PassageController();