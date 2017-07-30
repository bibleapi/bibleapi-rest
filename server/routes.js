import { Router } from 'express';

import PassageController from './controllers/passage.controller';

import errorHandler from './middleware/error-handler';

const routes = new Router();

routes.get('/favicon.ico', function(req, res) {
  res.sendStatus(204);
});

routes.get('/:reference', PassageController.find);

routes.use(errorHandler);

export default routes;
