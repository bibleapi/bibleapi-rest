import { Router } from 'express';

import MetaController from './controllers/meta.controller';
import PassageController from './controllers/passage.controller';

import errorHandler from './middleware/error-handler';

const routes = new Router();

routes.get('/favicon.ico', function(req, res) {
  res.sendStatus(204);
});

routes.get('/random', PassageController.findRandomProverb);

routes.get('/:reference', PassageController.find);

routes.get('/meta/:translation', MetaController.find);

routes.use(errorHandler);

export default routes;
