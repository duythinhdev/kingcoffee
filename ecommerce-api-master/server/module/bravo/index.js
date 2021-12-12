exports.services = {
    Bravo: require('./services/bravo.services'),
};
  
exports.router = (router) => {
    require('./routes/bravo.route')(router);
};
  