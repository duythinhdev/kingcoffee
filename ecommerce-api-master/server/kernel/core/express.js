/* eslint no-param-reassign: 0 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const methodOverride = require('method-override');
const morgan = require('morgan');
const SwigEngine = require('swig').Swig;
const info = require('../../../package.json');
const nconf = require('nconf');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const compression = require('compression');

const swig = new SwigEngine();

exports.name = 'kernel-app';

exports.config = {
  publicPath: path.resolve('../public')
};

// Expose app
exports.core = (kernel) => {
  kernel.addProp('app', express());
  kernel.app.use(compression());
  kernel.app.engine('swig', swig.renderFile);
  kernel.app.engine('html', swig.renderFile);
  kernel.app.set('view engine', 'swig');
  kernel.app.set('views', path.join(__dirname, '..', '..', 'views'));
  kernel.app.set('view cache', false);
  kernel.app.disable('x-powered-by');
  kernel.app.locals.baseUrl = nconf.get('baseUrl');

  process.env.ALLOW_CORS && kernel.app.use(cors());
  kernel.app.use(bodyParser.json({limit: "50mb"}));
  kernel.app.use(bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
  }));
  kernel.app.use(bodyParser.json());
  kernel.app.use(methodOverride());
  if (process.env.NODE_ENV === 'production') {
    // log only 4xx and 5xx responses to console
    kernel.app.use(morgan('dev', {
      skip(req, res) {
        return res.statusCode < 400;
      }
    }));
  } else {
    kernel.app.use(morgan('dev'));
  }

  kernel.app.use(express.static(this.config.publicPath));
  kernel.app.use(session({
    secret: 'foo',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      url: process.env.MONGO_URI,
      autoRemove: 'native',
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    })
  }));

  kernel.app.get('/api-author', (req, res) => {
    res.status(200).send({
      author: 'Thanh Khuu <thanhkq@nichietsuvn.com>',
      appName: info.name,
      version: info.version
    });
  });
};
