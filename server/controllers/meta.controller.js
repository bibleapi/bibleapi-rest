import { getMetaInfo } from '../db/meta';
import BaseController from './base.controller';

class MetaController extends BaseController {

  find = async (req, res, next) => {
    try {
      const translation = req.params.translation;
      const result = getMetaInfo(translation);
      res.json(
        {
          translation: result
        }
      );
    } catch(err) {
      next(err);
    }
  };

}

export default new MetaController();