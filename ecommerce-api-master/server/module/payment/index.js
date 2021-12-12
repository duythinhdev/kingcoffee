require('./components/Braintree');

exports.model = {
  Transaction: require('./models/transaction'),
  Invoice: require('./models/invoice'),
  ShopFeaturedPackage: require('./models/shop-featured-package')
};

exports.router = (router) => {
  require('./routes/transaction')(router);
  require('./routes/paypal')(router);
  require('./routes/invoice')(router);
  require('./routes/shop-featured')(router);
  require('./routes/momo')(router);
  require('./routes/vnpay')(router);
  require('./routes/zalopay')(router);
  require('./routes/invest')(router);
};

exports.services = {
  Payment: require('./services/Payment'),
  ShopFeatured: require('./services/ShopFeatured'),
  Transaction: require('./services/Transaction')
};
