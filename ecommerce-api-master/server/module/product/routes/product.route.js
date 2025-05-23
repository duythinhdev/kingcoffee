const productController = require('../controllers/product.controller');

module.exports = (router) => {
  /**
   * @apiDefine productRequest
   * @apiParam {String}   name        product name
   * @apiParam {String}   [alias]     Alias name. Or will be generated from name automatically
   * @apiParam {String}   [description]
   * @apiParam {String}   [shortDescription]
   * @apiParam {String}   [type] `physical` or `digital`. Default is `physical`
   * @apiParam {Number}   [price]
   * @apiParam {Number}   [salePrice]
   * @apiParam {Number}   [stockQuantity]
   * @apiParam {String}   [categoryId]
   * @apiParam {String}   [brandId]
   * @apiParam {String}   [sku] stock keeping unit
   * @apiParam {String}   [upc] univeral product code
   * @apiParam {String}   [mpn] manufater part number
   * @apiParam {String}   [ean] european article number
   * @apiParam {String}   [jan] japanese artical number
   * @apiParam {String}   [isbn] international standard book number
   * @apiParam {Boolean}   [isActive] Flag to active / show product in frontend, isActive === true is status = 1
   * @apiParam {String}   [mainImage] media id. if it is not set and images is not empty, will get first images
   * @apiParam {String[]}   [images] media id
   * @apiParam {Object[]}   [specifications] `[{key, value}]`
   * @apiParam {String}   [specifications.key] special keys
   * @apiParam {String}   [specifications.value] special value
   * @apiParam {Boolean}   [featured=false] allow for admin user only
   * @apiParam {Boolean}   [isActive=true]
   * @apiParam {String}   [taxClass] eg VAT
   * @apiParam {Number}   [taxPercentage] eg 10 (in percentage)
   * @apiParam {String}   [digitalFileId] Media id for digital file
   * @apiParam {String[]}   [restrictCODAreas] array of zip code seller can entered
   * @apiParam {Boolean}   [freeShip] Freeship checkbox. Default is `true`
   * @apiParam {Object[]}   [restrictFreeShipAreas] array of area which allow freeship
   * @apiParam {String}   [restrictFreeShipAreas.areaType] `zipCode`, `city`, `state`, `country`
   * @apiParam {String}   [restrictFreeShipAreas.value] zipCode or city id, state id, country iso code
   * @apiParam {Boolean} [dailyDeal] daily deal option. Default is `false`
   * @apiParam {String} [dealTo] daily deal date format. Time for this deal
   * @apiParam {Object}   [metaSeo] `{keywords, description}`
   * @apiParam {Boolean} [isTradeDiscount] isTradeDiscount
   * @apiParam {Number}   [status] EX: 1. Success, 2: watting, 3. reject. status = 3 is isActive = false
   * @apiParam {String}   [note] comment product reject
   * @apiParam {Object}   configs `{isTradeDiscountSeller: true, tradeDiscountGoldtime: 15}`
   * @apiParam {String} [unit] // bag, package, box
   * @apiParam {String} [group]
   * @apiParam {String} [expiryDate] // year
   * @apiParam {Number} [packingSpecifications]
   * @apiParam {String} [producer]
   * @apiParam {String} [country]
   */

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/products?:name&&:q&:sort&:sortType&:page&:take  Get list products
   * @apiDescription Get list products
   * @apiParam {String}   [name]      product name
   * @apiParam {String}   [shortDescription]      product description
   * @apiParam {String}   [q] search all allowed fields
   * @apiParam {Number}   [take] Response item. defaultl `10`
   * @apiParam {Number}   [page] page should take from
   * @apiParam {String}   [sort] field to sort. or `random`
   * @apiParam {String}   [sortType] `desc` or `asc`
   * @apiPermission all
   */
  router.get(
    '/v1/products',
    Middleware.loadUser,
    productController.search,
    Middleware.Response.success('search')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/products/search?:name&brandId&:shopId&&:q&dailyDeal&discounted&bestSell&soldOut&:sort&:sortType&:status&status&:page&:take  Get list products
   * @apiDescription Get list products
   * @apiParam {String}   [name]      product name
   * @apiParam {String}   [shortDescription]      product description
   * @apiParam {String}   [q] search all allowed fields
   * @apiParam {Number}   [take] Response item. defaultl `10`
   * @apiParam {Number}   [page] page should take from
   * @apiParam {String}   [sort] field to sort. or `random`
   * @apiParam {String}   [sortType] `desc` or `asc`
   * @apiParam {String}   [brandId]
   * @apiParam {String}   [shopId]
   * @apiParam {Boolean}  [dailyDeal]
   * @apiParam {Boolean}  [discounted]
   * @apiParam {Boolean}  [bestSell]
   * @apiParam {Boolean}  [soldOut]
   * @apiParam {Number}  [status]
   * @apiParam {String} [type]
   * @apiPermission all
   */
  router.get(
    '/v1/products/search',
    Middleware.loadUser,
    productController.search,
    Middleware.Response.success('search')
  );

    /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/products/country  Get list available product's countries
   * @apiDescription Get list products
   * @apiPermission all
   */
  router.get(
    '/v1/products/country',
    Middleware.loadUser,
    productController.getCountry,
    Middleware.Response.success('search')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {post} /v1/products  Create new product
   * @apiDescription Create new product
   * @apiUse authRequest
   * @apiUse productRequest
   * @apiPermission superadmin
   */
  router.post(
    '/v1/products',
    Middleware.isAuthenticated,
    Middleware.isAdminOrSeller,
    productController.create,
    Middleware.Response.success('product')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {put} /v1/products/:id  Update a product
   * @apiDescription Update a product
   * @apiUse authRequest
   * @apiUse productRequest
   * @apiPermission superadmin
   */
  router.put(
    '/v1/products/:id',
    Middleware.isAuthenticated,
    Middleware.isAdminOrSeller,
    productController.findOne,
    productController.update,
    Middleware.Response.success('update')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {delete} /v1/products/:id Remove a brand
   * @apiDescription Remove a product
   * @apiUse authRequest
   * @apiParam {String}   id        Brand id
   * @apiPermission superadmin
   */
  router.delete(
    '/v1/products/:id',
    Middleware.isAuthenticated,
    Middleware.isAdminOrSeller,
    productController.findOne,
    productController.remove,
    Middleware.Response.success('remove')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/products/events Get list event products
   * @apiDescription Get list event products
   * @apiPermission admin
   */
  router.get(
    '/v1/products/events',
    Middleware.hasRole('admin'),
    productController.getEventProducts,
    Middleware.Response.success('eventProducts')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/products/:id Get product details
   * @apiDescription Get product details
   * @apiParam {String}   id        product id
   * @apiPermission all
   */
  router.get(
    '/v1/products/:id',
    Middleware.loadUser,
    productController.details,
    Middleware.Response.success('product')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/fiveElementActive Get five element event is active
   * @apiDescription Get five element is active details
   * @apiPermission all
   */
  router.get(
    '/v1/fiveElementActive',
    Middleware.loadUser,
    productController.fiveElementActive,
    Middleware.Response.success('product')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {get} /v1/products/:productId/related Get related products
   * @apiDescription Get related products by product category
   * @apiParam {String}   productId        product id
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": [
   *         "_id": "....",
   *         "name": "product name",
   *         "..." : "..."
   *     ],
   *     "error": false
   *  }
   * @apiPermission all
   */
  router.get(
    '/v1/products/:productId/related',
    productController.findOne,
    productController.related,
    Middleware.Response.success('items')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {post} /v1/products/alias/check Check alias
   * @apiDescription Check alias is exist or not
   * @apiParam {String} alias
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "exist": true
   *     },
   *     "error": false
   *  }
   * @apiPermission seller
   */
  router.post(
    '/v1/products/alias/check',
    Middleware.isAuthenticated,
    Middleware.isAdminOrSeller,
    productController.checkAlias,
    Middleware.Response.success('checkAlias')
  );

  /**
   * @apiGroup Product
   * @apiVersion 1.0.0
   * @api {post} /v1/products/updateProductAlias
   * @apiDescription Update all product alias
   * @apiPermission admin
   */
  router.post(
    '/v1/products/updateProductAlias',
    Middleware.hasRole("admin"),
    productController.updateAliasForAllProduct,
    Middleware.Response.success()
  );
};
