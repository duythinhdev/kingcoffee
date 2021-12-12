exports.router = (router) => {
    require("./routes/ghtk.route")(router);
};

exports.services = {
    GHTK: require('./services/ghtk')
};