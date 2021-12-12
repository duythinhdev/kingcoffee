exports.zaloPayIpnRequest = async (req, res, next) => {
  try {
    const body = await Service.Payment.updateZaloPayTransaction(req.body);
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
    res.locals.response = await Service.Payment.createZaloPayTransaction(req.body);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.callback = async (req, res, next) => {
  try {
    res.locals.response = await Service.Payment.callbackZaloPayPayment(req.query);
    return next();
  } catch (e) {
    return next(e);
  }
};

