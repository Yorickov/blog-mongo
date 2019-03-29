import express from 'express';
import morgan from 'morgan';
import path from 'path';
import Router from 'named-routes';
import methodOverride from 'method-override';
import session from 'express-session';
import format from 'date-fns/format';

import { flashFn } from './lib/middlwares';
import NotFoundError from './lib/NotFoundError.js';

import addRoutes from './routes';
import container from './container';

export default () => {
  const app = express();

  const router = new Router();
  const expressRouter = express.Router();
  router.extendExpress(expressRouter);
  router.registerAppHelpers(app);

  app.use(morgan('short'));
  app.use(express.urlencoded({ extended: true }));
  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));

  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, './views'));

  app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(flashFn());

  app.use((req, res, next) => {
    res.locals.formatDate = (dateString, dateFormat) => format(dateString, dateFormat);
    res.locals.isSignedIn = () => req.session.userId !== undefined;
    res.locals.currentUserId = req.session.userId;
    res.locals.currentUserProfileName = req.session.userProfileName;
    next();
  });

  app.use(express.static(path.join(__dirname, '..', 'public')));

  addRoutes(expressRouter, container);
  app.use(expressRouter);

  app.use((req, res, next) => next(new NotFoundError()));
  app.use((err, req, res, next) => { // eslint-disable-line
    res.status(err.status);
    if (err.status === 404 || err.status === 403) {
      res.render(`errors/${err.status}`);
      return;
    }
    res.render('errors/500');
  });

  return app;
};
