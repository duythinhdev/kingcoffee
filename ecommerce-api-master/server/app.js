const path = require('path');
const nconf = require('nconf');

// cause we have to run queue with local file, so we will create queue name just for single server
// for scaling, so we will create a random key her as prefix/subfix for some queue
process.env.LOCAL_ID = Math.random().toString(36).substring(7);
process.env.APP_ROOT_DIR = path.join(__dirname, '..');

nconf.argv()
  .env()
  .file({ file: path.resolve(path.join(__dirname, 'config', `${process.env.NODE_ENV}.json`)) });

const Kernel = require('./kernel');

const kernel = new Kernel();

kernel.loadModule(require('./module/system'));
kernel.loadModule(require('./module/user'));
kernel.loadModule(require('./module/passport'));
kernel.loadModule(require('./module/post'));
kernel.loadModule(require('./module/media'));
kernel.loadModule(require('./module/i18n'));
kernel.loadModule(require('./module/newsletter'));
kernel.loadModule(require('./module/banner'));
kernel.loadModule(require('./module/shop'));
kernel.loadModule(require('./module/product'));
kernel.loadModule(require('./module/order'));
kernel.loadModule(require('./module/review'));
kernel.loadModule(require('./module/country'));
kernel.loadModule(require('./module/notification'));
kernel.loadModule(require('./module/complain'));
kernel.loadModule(require('./module/report'));
kernel.loadModule(require('./module/payment'));
kernel.loadModule(require('./module/message'));
kernel.loadModule(require('./module/coupons'));
kernel.loadModule(require('./module/payout'));
kernel.loadModule(require('./module/invest'));
kernel.loadModule(require('./module/shipping'));
kernel.loadModule(require('./module/adminlog'));
kernel.loadModule(require('./module/event'));
kernel.loadModule(require('./module/counters'));
kernel.loadModule(require('./module/inventory'));
kernel.loadModule(require('./module/delivery'));
kernel.loadModule(require('./module/sale'));
kernel.loadModule(require('./module/kpi'));
kernel.loadModule(require('./module/promotion'));
kernel.loadModule(require('./module/bravo'));
kernel.loadModule(require('./module/wheel'));

// NOTE - compose at last
kernel.compose();

module.exports = kernel;
