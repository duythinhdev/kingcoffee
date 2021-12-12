const saleController = require('../controllers/sale.controller');

module.exports = (router) => {
  
  /**
   * @apiGroup Sale
   * @apiVersion 1.0.0
   * @api {get} /v1/sales?:status&:sort&:sortType&:page&:take  Get list sales (successful orders)
   * @apiDescription Get list successful orders of current customer or all if admin
   * @apiUse authRequest
   * @apiPermission user
   */
  router.get(
    '/v1/sales',
    Middleware.hasRole('admin'),
    saleController.list,
    Middleware.Response.success('list')
  );
};