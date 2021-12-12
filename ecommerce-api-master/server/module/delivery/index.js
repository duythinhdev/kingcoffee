exports.router = (router) => {
  require("./routes/delivery.route")(router);
};

exports.services = {
  Delivery: require("./services/delivery.service"),
};
