const vnpayController = require('../controllers/vnpay.controller');

module.exports = (router) => {
  router.get(
    '/v1/payment/vnpay/ipn',
    vnpayController.vnpIpnRequest
  );

  router.get(
    '/v1/payment/vnpay/ipn-mobile',
    vnpayController.vnpIpnMobileRequest
  );

  router.get(
    '/v1/payment/vnpay/callback',
    vnpayController.callback,
    Middleware.Response.success('response')
  );

  // test
  router.post(
    '/v1/payment/vnpay',
    vnpayController.createPaymentRequest,
    Middleware.Response.success('response')
  );
};
