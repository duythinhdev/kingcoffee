const ghtkController = require('../controllers/ghtk.controllers');
module.exports = router => {
  /**
   * @apiGroup Shipping
   * @apiVersion 1.0.0
   * @api {post} /v1/reports  GHTK webhook
   * @apiDescription GHTK update shipping status for orderDetail
   * @apiParam {String}   label_id
   * @apiParam {Number}   status_id
   * @apiParam {String}   action_time
   * @apiParam {String}   reason_code
   * @apiParam {String}   reason
   * @apiParam {Number}   return_part_package
   */
  router.post(
    '/v1/shipping/ghtk/webhook',
    ghtkController.ghtkWebhook,
    Middleware.Response.success()
  );
  
    /**
   * @apiGroup Shipping
   * @apiVersion 1.0.0
   * @api {get} /v1/reports  Get list shipping status of an order
   * @apiDescription Get list shipping status of an order
   */
  router.get(
    '/v1/ghtk/shippingstatus/:order_id',
    ghtkController.getShippingStatusList,
    Middleware.Response.success('shippingList')
  );
};

