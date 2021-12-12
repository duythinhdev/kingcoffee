const zalopayController = require('../controllers/zalopay.controller');

module.exports = (router) => {
  router.post(
    '/v1/payment/zalopay/ipn',
    zalopayController.zaloPayIpnRequest
  );

  router.get(
    '/v1/payment/zalopay/callback',
    zalopayController.callback,
    Middleware.Response.success('response')
  );

  // test
  router.post(
    '/v1/payment/zalopay',
    zalopayController.createPaymentRequest,
    Middleware.Response.success('response')
  );
};
