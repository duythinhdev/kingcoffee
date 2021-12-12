const momoController = require('../controllers/momo.controller');

module.exports = (router) => {
  router.post(
    '/v1/payment/momo/ipn',
    momoController.momoIpnRequest
  );

  router.get(
    '/v1/payment/momo/callback',
    momoController.callback,
    Middleware.Response.success('response')
  );

  // test
  router.post(
    '/v1/payment/momo',
    momoController.createPaymentRequest,
    Middleware.Response.success('response')
  );
};
