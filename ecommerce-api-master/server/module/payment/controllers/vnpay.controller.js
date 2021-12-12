exports.vnpIpnRequest = async (req, res, next) => {
  try {
    const body = await Service.Payment.updateVNPayTransaction(req.query);
    res.set('Content-Type', 'application/json;charset=UTF-8')
      .status(200)
      .send(body);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.vnpIpnMobileRequest = async (req, res, next) => {
  try {
    req.query.flatform = "mobile";
    const body = await Service.Payment.updateVNPayTransaction(req.query);
    res.set('Content-Type', 'application/json;charset=UTF-8')
      .status(200)
      .send(body);
    return next();
  } catch (e) {
    return next(e);
  }
};

// test
exports.createPaymentRequest = async (req, res, next) => {
  try {
    req.body.ipAddr = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress; 
    req.body.flatform = req.headers.platform;
    res.locals.response = await Service.Payment.createVNPayTransaction(req.body);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.callback = async (req, res, next) => {
  try {
    const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    req.query.userIP = userIP;
    req.query.flatform = req.headers.platform;
    res.locals.response = await Service.Payment.callbackVNPayPayment(req.query);
    return next();
  } catch (e) {
    return next(e);
  }
};

