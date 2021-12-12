const promotionTypeController = require('../controllers/promotionType.controller');

module.exports = (router) => {
    /**
         * @apiGroup PromotionType
         * @apiVersion 1.0.0
         * @api {get} /v1/promotionType?:isActive&:sort&:sortType&:page&:take
         * @apiDescription Get list promotion type
         * @apiUse authRequest
     */
    router.get(
        '/v1/promotionTypes',
        Middleware.isAuthenticated,
        promotionTypeController.list,
        Middleware.Response.success()
    );

    /**
         * @apiGroup PromotionType
         * @apiVersion 1.0.0
         * @api {get} /v1/promotionType/:id
         * @apiDescription Get promotion type by Id
         * @apiUse authRequest
     */
    router.get(
        '/v1/promotionTypes/:id',
        Middleware.isAuthenticated,
        promotionTypeController.findById,
        Middleware.Response.success()
    );

    /**
         * @apiGroup PromotionType
         * @apiVersion 1.0.0
         * @api {post} /v1/promotionType
         * @apiDescription Create promotion type
         * @apiUse authRequest
    */
    router.post(
        '/v1/promotionTypes',
        Middleware.hasRole("admin"),
        promotionTypeController.create,
        Middleware.Response.success()
    );

    /**
         * @apiGroup PromotionType
         * @apiVersion 1.0.0
         * @api {put} /v1/promotionType/:id
         * @apiDescription Update promotion type
         * @apiUse authRequest
         * @apiPermission user
    */
    router.put(
        '/v1/promotionTypes/:id',
        Middleware.hasRole("admin"),
        promotionTypeController.update,
        Middleware.Response.success()
    );


    /**
         * @apiGroup PromotionType
         * @apiVersion 1.0.0
         * @api {delete} /v1/promotionType/:id
         * @apiDescription Remove promotion type
         * @apiUse authRequest
         * @apiPermission user
    */
    router.delete(
        '/v1/promotionTypes/:id',
        Middleware.hasRole("admin"),
        promotionTypeController.remove,
        Middleware.Response.success()
    );

     /**
         * @apiGroup PromotionType
         * @apiVersion 1.0.0
         * @api {post} /v1/promotionTypes/stop/:id
         * @apiDescription Stop promotion type
         * @apiUse authRequest
     */
    router.put(
        '/v1/promotionTypes/stop/:id',
        Middleware.hasRole("admin"),
        promotionTypeController.stop,
        Middleware.Response.success()
    );
}