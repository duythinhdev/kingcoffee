exports.router = (router) => {
  require("./routes/sale.route")(router);
};

exports.services = {
  Sale: require("./services/sale.service"),
};
