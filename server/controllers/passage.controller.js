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

}

export default new PassageController();