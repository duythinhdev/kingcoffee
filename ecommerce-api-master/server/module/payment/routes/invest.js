const investController = require('../controllers/invest.controller');

module.exports = (router) => {
  /**
   * @apiGroup Payment - Invest
   * @apiVersion 1.0.0
   * @api {get} /v1/payment/invoices  Create payment request to invest user wallet
   * @apiDescription  Create invest payment request
   * @apiPermission user
   */
  router.post(
    '/v1/test/payment/invest',
    Middleware.isAuthenticated,
    investController.createPaymentRequest,
    Middleware.Response.success('search')
  );
};
