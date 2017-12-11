const express = require('express');
const bunyanMiddleware = require('bunyan-middleware');
const expressNunjucks = require('express-nunjucks');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const xFrameOptions = require('x-frame-options');
const requireAll = require('require-all');
const moment = require('moment');

const auth = require('./apiKeyAuth');
const errors = require('./errors');
const healthcheck = require('../app/health/healthcheck');

// eslint-disable-next-line no-unused-vars
const formatDate = (str, format) => moment(str).format(format);
const slugify = (str) => str.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()’]/g,"").replace(/ +/g,'_').toLowerCase();
const htmlLog = (nunjucksSafe) => (a) => nunjucksSafe('<script>console.log(' + JSON.stringify(a, null, '\t') + ');</script>');

const flatten = (data) => {
  let result = {};

  let recurse = (cur, prop) => {
    let isEmpty = true;

    for (let p in cur) {
      isEmpty = false;
      recurse(cur[p], prop + (!~p.indexOf('index') ? '/' + p : ''));
    }

    if (typeof cur === 'function') {
      result[prop] = cur;
    } else if (isEmpty && prop) {
      result[prop] = {};
    }
  };

  recurse(data, '');

  return result;
};

module.exports = (config, log, callback, includeErrorHandling = true) => {
  const app = express();
  app.locals.config = config;

  app.set('json spaces', 2);
  app.set('trust proxy', true);

  setupBaseMiddleware(app, log);
  setupOperationalRoutes(app);
  setupViewEngine(app);
  setupStaticRoutes(app, log);
  setupAuthMiddleware(app, log);
  setupRouters(app, log);

  if (includeErrorHandling) {
    setupErrorHandling(app, config);
  }

  healthcheck(config, log)
    .then((result) => {
      if (!result.healthy) {
        return log.error(result);
      }

      log.info(result);
    });

  return callback(null, app);
};

function setupBaseMiddleware(app, log) {
  app.use(bunyanMiddleware({
    logger: log,
    obscureHeaders: ['Authorization'],
  }));

  app.use(function detectAzureSSL(req, res, next) {
    if (!req.get('x-forwarded-proto') && req.get('x-arr-ssl')) {
      req.headers['x-forwarded-proto'] = 'https';
    }

    return next();
  });

  app.use(helmet());
  app.use(helmet.noCache());
  app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(xFrameOptions());
}

function setupOperationalRoutes(app) {
  app.get('/health', (req, res) =>
    healthcheck(app.locals.config, req.log)
      .then((result) => {
        if (!result.healthy) {
          res.status(500);
        }

        res.json(result);
      })
      .catch((err) => errors.unexpected(res, err.message)));
}

function setupViewEngine (app) {
  let config = app.locals.config;

  app.set('view engine', 'html');
  app.set('views', [
    path.join(__dirname, '../app/views/'),
    path.join(__dirname, '../lib/')
  ]);

  var nunjucks = expressNunjucks(app, {
      autoescape: true,
      watch: config.dev
  });

  nunjucks.env.addFilter('slugify', slugify);
  nunjucks.env.addFilter('formatDate', formatDate);
  nunjucks.env.addFilter('log', htmlLog(nunjucks.env.getFilter('safe')));

  return app;
}

function setupStaticRoutes (app, logger) {
  let config = app.locals.config;

  app.use(favicon(path.join(__dirname, '../node_modules/govuk_template_mustache/assets/images/favicon.ico')));

  if (config.dev) {
    var webpack = require('webpack');
    var webpackDevMiddleware = require('webpack-dev-middleware');
    var webpackConfig = require('../webpack.config');

    var compiler = webpack(webpackConfig);
    app.use(webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath
    }));
    logger.info('Webpack compilation enabled');

    var chokidar = require('chokidar');
    // eslint-disable-next-line no-unused-vars
    chokidar.watch('./app', { ignoreInitial: true }).on('all', (event , path) => {
      logger.info("Clearing /app/ module cache from server");
      Object.keys(require.cache).forEach(function(id) {
        if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id];
      });
    });
  }

  // Middleware to serve static assets
  [
    '/public',
    '/node_modules/govuk_template_mustache/assets',
    '/node_modules/govuk_frontend_toolkit'
  ].forEach((folder) => {
    app.use('/public', express.static(path.join(__dirname, '../', folder)));
  });

  // send assetPath to all views
  app.use(function (req, res, next) {
    res.locals.asset_path = "/public/";
    next();
  });

  return app;
}

function setupAuthMiddleware(app, log) {
  const authMiddleware = auth(app.locals.config.auth, log);
  if (authMiddleware) app.use(authMiddleware);
}

function setupRouters(app, log) {
  log.info('registering controllers...');

  let routes = flatten(requireAll({
    dirname:  __dirname + '/../app/controllers',
    recursive: true,
    resolve: (router) => () => router
  }));

  for (let uri in routes) {
    log.info(uri, routes[uri]);
    app.use(uri, routes[uri]());
  }
};

function setupErrorHandling(app) {
  app.use(function notFoundHandler(req, res) {
    errors.notFound(res, 'No handler exists for this url');
  });

  // eslint-disable-next-line no-unused-vars
  app.use(function errorHandler(err, req, res, next) {
    req.log.warn(err);
    errors.unexpected(res, err);
  });
}
