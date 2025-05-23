  const orderController = require('../controllers/order.controller');

module.exports = (router) => {
  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @apiName Create new order
   * @api {post} /v1/orders
   * @apiDescription Check out for order. Allow for guest
   * @apiUse authRequest
   * @apiParam {Object[]}   products products for the orders
   * @apiParam {String}   products.productId product id
   * @apiParam {Number}   products.quantity product quantity. default is 1
   * @apiParam {String}   [products.userNote] custom note for this product
   * @apiParam {String}   [products.productVariantId] product variant if have
   * @apiParam {String}   [products.couponCode] Coupon code if have
   * @apiParam {String}   paymentMethod Payment type. Just allow `cod` for now
   * @apiParam {String}   [shippingMethod] Shipping type
   * @apiParam {String}   [shippingAddress] required for `cod` method
   * @apiParam {String}   [phoneNumber]
   * @apiParam {String}   [email]
   * @apiParam {String}   [firstName]
   * @apiParam {String}   [lastName]
   * @apiParam {String}   [streetAddress]
   * @apiParam {String}   [city]
   * @apiParam {String}   [state]
   * @apiParam {String}   [country]
   * @apiParam {String}   [district]
   * @apiParam {String}   [ward]
   * @apiParam {String}   [zipCode]
   * @apiParam {String}   [userCurrency] Currency of user, which query in the system config
   * @apiParam {String}   [phoneVerifyCode] Phone verify code if `paymentMethod` is `cod`. Require if it is `COD`
   * @apiPermission all
   */
  router.post(
    '/v1/orders',
    Middleware.isAuthenticated,
    orderController.createOrderV2,
    Middleware.Response.success('order')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @apiName Create new order
   * @api {post} /v1/qr-orders
   * @apiDescription Check out for order. Allow for guest
   * @apiUse authRequest
   * @apiParam {Object[]}   products products for the orders
   * @apiParam {String}   products.productId product id
   * @apiParam {Number}   products.quantity product quantity. default is 1
   * @apiParam {String}   [products.userNote] custom note for this product
   * @apiParam {String}   [products.productVariantId] product variant if have
   * @apiParam {String}   [products.couponCode] Coupon code if have
   * @apiParam {String}   paymentMethod Payment type. Just allow `cod` for now
   * @apiParam {String}   [shippingMethod] Shipping type
   * @apiParam {String}   [shippingAddress] required for `cod` method
   * @apiParam {String}   [phoneNumber]
   * @apiParam {String}   [email]
   * @apiParam {String}   [firstName]
   * @apiParam {String}   [lastName]
   * @apiParam {String}   [streetAddress]
   * @apiParam {String}   [city]
   * @apiParam {String}   [state]
   * @apiParam {String}   [country]
   * @apiParam {String}   [district]
   * @apiParam {String}   [ward]
   * @apiParam {String}   [zipCode]
   * @apiParam {String}   [userCurrency] Currency of user, which query in the system config
   * @apiParam {String}   [phoneVerifyCode] Phone verify code if `paymentMethod` is `cod`. Require if it is `COD`
   * @apiPermission all
   */
  router.post(
    '/v1/qr-orders',
    Middleware.isAuthenticated,
    orderController.createQROrderV2,
    Middleware.Response.success('order')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {post} /v1/orders/statistics Payment goldtime
   * @apiDescription Payment goldtime
   * @apiUse authRequest with x-api-key
   * @apiPermission all
   */
  router.get(
    '/v1/orders/totalPriceCheckoutByDate',
    Middleware.checkApiKey,
    orderController.totalPriceCheckoutByDate,
    Middleware.Response.success('list')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {get} /v1/orders?:status&:sort&:sortType&:page&:take  Get list orders
   * @apiDescription Get list orders of current customer. Or all if admin
   * @apiUse authRequest
   * @apiPermission user
   */
  router.get(
    '/v1/orders',
    Middleware.isAuthenticated,
    orderController.list,
    Middleware.Response.success('list')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {get} /v1/orders?:status&:sort&:sortType&:page&:take  Get list orders
   * @apiDescription Get list orders of current customer. Or all if admin
   * @apiUse authRequest
   * @apiPermission user
   */
  router.get(
    '/v1/qr-orders-amount',
    Middleware.isAuthenticated,
    orderController.qrOrdersTotalAmount,
    Middleware.Response.success('list')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {get} /v1/orders/getAll?:status&:sort&:sortType  Get list all orders
   * @apiDescription Get list all orders of current customer. Or all if admin
   * @apiUse authRequest
   * @apiPermission user
   */
  router.get(
    '/v1/orders/getAll',
    Middleware.isAuthenticated,
    orderController.getAllList,
    Middleware.Response.success('list')
  );


    /**
   * @apiGroup getAllListScanned
   * @apiVersion 1.0.0
   * @api {get} /v1/orders/getAllListScanned?:status&:sort&:sortType  Get list all orders
   * @apiDescription Get list all orders of current customer. Or all if admin
   * @apiUse authRequest
   * @apiPermission user
   */
     router.get(
      '/v1/orders/getAllListScanned',
      Middleware.isAuthenticated,
      orderController.getAllListScanned,
      Middleware.Response.success('list')
    );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {get} /v1/orders/:orderid Get details of the order
   * @apiDescription Get details of the order
   * @apiUse authRequest
   * @apiPermission user
   */
  router.get(
    '/v1/orders/:orderId',
    Middleware.isAuthenticated,
    orderController.details,
    Middleware.Response.success('order')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {post} /v1/orders/:orderid/payment-goldtime Payment goldtime
   * @apiDescription Payment goldtime
   * @apiUse authRequest
   * @apiPermission user
   */
  router.post(
    '/v1/orders/:orderId/payment-goldtime',
    Middleware.isAuthenticated,
    orderController.paymentGoldtime,
    Middleware.Response.success('paymentGoldtime')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {post} /v1/orders/:orderid/check-payment Check payment
   * @apiDescription Check payment
   * @apiUse authRequest
   * @apiPermission user
   */
  router.post(
    '/v1/orders/:orderId/check-payment',
    Middleware.isAuthenticated,
    orderController.checkPayment,
    Middleware.Response.success('checkPayment')
  );

  /**
   * @apiGroup Order
   * @apiVersion 1.0.0
   * @api {put} /v1/orders/:orderid/payment-status Update status payment
   * @apiDescription Update status payment
   * @apiUse authRequest
   * @apiPermission user
   */
  router.put(
    '/v1/orders/:orderId/payment-status',
    Middleware.isAuthenticated,
    orderController.paymentStatus,
    Middleware.Response.success('paymentStatus')
  );

  router.put(
    '/v1/orders/cancel/:orderId',
    Middleware.hasRole('admin'),
    orderController.cancelOrder,
    Middleware.Response.success('cancelStatus')
  );

  router.put(
    '/v1/orders/reassignHub/:orderId',
    Middleware.hasRole('admin'),
    orderController.reassignHub,
    Middleware.Response.success('reassignHub')
  );

  router.put(
    '/v1/orders/confirmOrderHub/:orderId',
    Middleware.hasRole('admin'),
    orderController.confirmOrderHub,
    Middleware.Response.success('confirmOrderHub')
  );

  router.put(
    '/v1/orders/updateOrder/:orderId',
    Middleware.hasRole('admin'),
    orderController.updateOrder,
    Middleware.Response.success('updateOrder')
  );

  router.put(
    '/v1/orders/assignHub/:orderId',
    Middleware.hasRole('admin'),
    orderController.assignHub,
    Middleware.Response.success('updateOrder')
  );

  // test order code service
  // router.get(
  //   '/v1/orderCodeService/:role',
  //   orderController.createOrderCode,
  //   Middleware.Response.success('orderCode')
  // );
};
