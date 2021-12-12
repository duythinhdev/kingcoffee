exports.router = (router) => {
    require("./routes/wallet.route")(router);
};

exports.services = {
    Wallet: require("./services/wallet"),
    Vendor: require("./services/vendor"),
    KPIs: require("./services/kpi")
}