exports.model = {
  AdminLog: require('./models/adminlog')
};

exports.services = {
  AdminLog: require('./services/adminlog')
};

exports.status = {
  Changed: 'Chỉnh sửa',
  Added: 'Tạo',
  Deleted: 'Xóa'
};
exports.router = (router) => {
  require('./routes/adminlog-routes')(router);
};
