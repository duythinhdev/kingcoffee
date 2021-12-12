exports.model = {
  Device: require('./models/device'),
  EmailSmsLog: require('./models/email_sms_log'),
  Notification: require('./models/notification')
};

exports.services = {
  Pusher: require('./services/Pusher'),
  Sms: require('./services/sms.service'),
  Email: require('./services/email.service'),
  Notification: require('./services/notification.service'),
  PushNotification: require('./services/pushNotification.service'),
  Promotion: require('../promotion/services/promotion.service'),
};

exports.router = (router) => {
  require('./routes/pusher.route')(router);
  require('./routes/device.route')(router);
  require('./routes/notification.route')(router);
};
