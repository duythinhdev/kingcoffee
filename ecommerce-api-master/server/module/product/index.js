
exports.middleware = {
  isAdminOrSeller(req, res, next) {
    if (!req.user || (!req.user.shopId && !req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value))) {
      return next(PopulateResponse.forbidden());
    }

    return next();
  }
};

exports.model = {
  Product: require('./models/product'),
  ProductCategory: require('./models/category'),
  ProductOption: require('./models/options'),
  ProductVariant: require('./models/variant'),
  Brand: require('./models/brand'),
  Wishlist: require('./models/wishlist')
};

exports.router = (router) => {
  require('./routes/brand.route')(router);
  require('./routes/categories.route')(router);
  require('./routes/options.route')(router);
  require('./routes/variant.route')(router);
  require('./routes/product.route')(router);
  require('./routes/wishlist.route')(router);
  require('./routes/stats.route')(router);
  require('./routes/import-export.route')(router);
};

exports.services = {
  Product: require('./services/product')
};

exports.agendaJobs = [{
  name: 'update-daily-deal-flag',
  interval: '6 hours',
  job: require('./agenda/update-daily-deal')
}, {
  name: 'update-sold-out',
  interval: '1 hours',
  job: require('./agenda/update-sold-out')
}];

exports.status = {
  success: 1,
  watting: 2,
  reject: 3
};
