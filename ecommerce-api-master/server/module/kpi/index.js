exports.model = {
    KPI: require('./models/kpi.model')
};
  
exports.router = (router) => {
    require('./routes/kpi.route')(router);
};

exports.services = {
    KPI: require('./services/kpi.service')
}