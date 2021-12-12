const inventoryController = require('../controllers/inventory.controller');

module.exports = (router) => {
  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/inventory/products?:q&:sort&:sortType  Get list products
   * @apiDescription Get list products
   * @apiParam {String}   [q] search all allowed fields
   * @apiParam {String}   [sort] field to sort. or `random`
   * @apiParam {String}   [sortType] `desc` or `asc`
   * @apiPermission all
   */
  router.get(
    '/v1/inventory/products',
    Middleware.checkApiKey,
    inventoryController.search,
    Middleware.Response.success('search')
  );

  /**
   * @apiGroup Product category
   * @apiVersion 1.0.0
   * @api {get} /v1/inventory/categories/tree Get tree
   * @apiDescription Get tree
   * @apiPermission all
   */
  router.get(
    '/v1/inventory/categories/tree',
    Middleware.checkApiKey,
    inventoryController.tree,
    Middleware.Response.success('tree')
  );
};
