exports.momoIpnRequest = async (req, res, next) => {
  try {
    const body = await Service.Payment.updateMomoTransaction(req.body);
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
    // add validate
    res.locals.response = await Service.Payment.createMomoTransaction(req.body);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.callback = async (req, res, next) => {
  try {
    res.locals.response = await Service.Payment.callbackMomoPayment(req.query);
    return next();
  } catch (e) {
    return next(e);
  }
};

