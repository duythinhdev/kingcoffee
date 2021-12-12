exports.router = (router) => {
    require('./routes/inventory.route')(router);   
};
  
exports.services = {
    Inventory: require('./services/inventory.service')
}