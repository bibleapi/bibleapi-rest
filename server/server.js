import helmet from 'helmet';
import express from 'express';
import winston from 'winston';
import { MongoClient } from 'mongodb';
import expressWinston from 'express-winston';
import routes from './routes';

const host = `${process.env.MONGODB_REPLICA_NODE_1},${process.env.MONGODB_REPLICA_NODE_2},${process.env.MONGODB_REPLICA_NODE_3}`;
const replicaSet = process.env.MONGODB_REPLICA_SET;
const useSsl = process.env.MONGODB_SSL;
const db = process.env.MONGODB_DATABASE;
const user = process.env.MONGODB_USERNAME;
const pass = process.env.MONGODB_PASSWORD;
const mongoDbUrl = `mongodb://${user}:${pass}@${host}/${db}?ssl=${useSsl}&replicaSet=${replicaSet}&authSource=admin`;

const app = express();

MongoClient.connect(mongoDbUrl, (error, mongoPool) => {

  if (error) {
    console.error(error);
    return;
  }

  app.mongoPool = mongoPool;

  // Helmet helps securing Express.js apps by setting various HTTP headers
  // https://github.com/helmetjs/helmet
  app.use(helmet());

  // Request logger
  // https://github.com/bithavoc/express-winston
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ],
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: true,
    ignoreRoute: function (req, res) { return false; }
  }));

  // Mount public routes
  app.use('/', express.static(`${__dirname}/public`));

  const apiPrefix = '/api/';
  app.use(apiPrefix, routes);

  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ]
  }));

  const nodePort = 3333;
  app.listen(nodePort, () => {
    console.info(`Restful API server is listening on port ${nodePort}`);
  });

});

/*
// index
server.get('/', router.respondIndex);
server.head('/', router.respondIndex);
// metadata
server.get('/api/v1/meta/:translation', router.getMeta);
server.get('/api/v1/meta/:translation/books', router.getMeta);
// passage
server.get('/api/v1/:passage', router.parsePassage);
server.head('/api/v1/:passage', router.parsePassage);
*/