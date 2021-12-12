exports.model = {
  PhoneVerify: require('./models/phone-verify'),
  UserSocial: require('./models/user-social')
};

exports.mongoosePlugin = require('./mongoosePlugin');

exports.services = {
  SocialConnect: {
    Facebook: require('./services/Facebook'),
    Google: require('./services/Google'),
    Apple: require('./services/Apple'),
    Invest: require('./services/Invest')
  },
  User: require('./services/User')
};

exports.router = (router) => {
  require('./routes/stats.route')(router);
  require('./routes/user.route')(router);
  require('./routes/phone.route')(router);
  require('./routes/connect.route')(router);
};
