exports.model = {
  Event: require('./models/event'),
  EventWinners: require('./models/event-winners'),
  EventRequest: require('./models/eventRequest'),
  EventVoucher: require('./models/event-voucher'),
  EventProduct: require('./models/event-product'),
};

exports.services = {
  Event: require('./services/event'),
  EventWinners: require('./services/event-winners'),
  RequestNHTS: require('./services/fiveElement')
};

exports.router = (router) => {
  require('./routes/event.route')(router);
};

