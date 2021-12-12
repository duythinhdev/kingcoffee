const deliveryController = require("../controllers/delivery.controller");

module.exports = router => {
  /**
   * @apiGroup Delivery
   * @apiVersion 1.0.0
   * @api {put} /v1/delivery/:orderCode Update order status by orderCode
   * @apiParam {String} orderCode
   * @apiParam {String='ghn', 'hub'} transportation
   * @apiParam {String='ordered', 'confirmed', 'processing', 'packed', 'handedOver', 'shipping', 'successDelivered', 'failDelivered'} orderStatus
   * @apiParam {Boolean} isDeliveryReject
   * @apiParam {String} senderId
   * @apiParam {String} senderName
   * @apiParam {String} senderPhone
   */
  router.put(
    "/v1/delivery/:orderCode",
    deliveryController.findOrderByOrderCode,
    deliveryController.updateOrder,
    Middleware.checkApiKey,
    Middleware.Response.success("update")
  );

  /**
   * @apiGroup Delivery
   * @apiVersion 1.0.0
   * @api {post} /v1/delivery/createShipmentHubOrWe Create Shipment
   * @apiParam {String} data
   */
  router.post(
    "/v1/delivery/createShipmentHubOrWe",
    deliveryController.createShipmentHubOrWe,
    Middleware.Response.success("create")
  );

  /**
   * @apiGroup Delivery
   * @apiVersion 1.0.0
   * @api {post} /v1/delivery/cancelShipmentHubOrWe Cancel Shipment
   * @apiParam {String} data
   */
  router.post(
    "/v1/delivery/cancelShipmentHubOrWe",
    deliveryController.cancelShipmentHubOrWe,
    Middleware.Response.success("cancel")
  );
};
