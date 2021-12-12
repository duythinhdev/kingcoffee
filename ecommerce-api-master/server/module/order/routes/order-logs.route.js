const orderLogsController = require("../controllers/order-logs.controller");

module.exports = (router) => {
  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {get} /v1/order/logs?:status&:sort&:sortType&:page&:take&startDate&toDate&paymentMethod  Get logs by orderId and eventType
   * @apiDescription Get list orders of shop. it is order details
   * @apiParam {String}   [startDate] start time in UTC format
   * @apiParam {String}   [toDate] to time in UTC format
   * @apiUse authRequest
   * @apiPermission seller
   */
  router.get(
    "/v1/order/logs",
    Middleware.isAuthenticated,
    orderLogsController.find,
    Middleware.Response.success("list")
  );
};
