const promotionController = require('../controllers/promotion.controller');

module.exports = (router) => {
    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {get} /v1/promotions?:isActive&:sort&:sortType&:page&:take
         * @apiDescription Get list promotions
         * @apiUse authRequest
     */
    router.get(
        '/v1/promotions',
        Middleware.isAuthenticated,
        promotionController.list,
        Middleware.Response.success()
    );

    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {get} /v1/promotions/:id
         * @apiDescription Get promotions by Id
         * @apiUse authRequest
     */
    router.get(
        '/v1/promotions/:id',
        Middleware.isAuthenticated,
        promotionController.findById,
        Middleware.Response.success()
    );

    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {post} /v1/promotions
         * @apiDescription Create promotions
         * @apiUse authRequest
    */
    router.post(
        '/v1/promotions',
        Middleware.hasRole("admin"),
        promotionController.create,
        Middleware.Response.success()
    );

    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {put} /v1/promotions/:id
         * @apiDescription Update promotions information
         * @apiUse authRequest
         * @apiPermission user
    */
    router.put(
        '/v1/promotions/:id',
        Middleware.hasRole("admin"),
        promotionController.update,
        Middleware.Response.success()
    );


    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {delete} /v1/promotions/:id
         * @apiDescription Remove promotions
         * @apiUse authRequest
         * @apiPermission user
    */
    router.delete(
        '/v1/promotions/:id',
        Middleware.hasRole("admin"),
        promotionController.remove,
        Middleware.Response.success()
    );

    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {get} /v1/promotions/list/promotionForUser
         * @apiDescription Get list promotions for user
         * @apiUse authRequest
     */
    router.get(
        '/v1/promotions/list/promotionForUser',
        Middleware.loadUser,
        promotionController.listPromotionForUser,
        Middleware.Response.success()
    );

    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {get} /v1/promotions/list/promotionForUser
         * @apiDescription Get list promotions for user
         * @apiUse authRequest
     */
    router.get(
        '/v1/promotions/list/productsOrderByPromotionType',
        Middleware.loadUser,
        promotionController.getPromotionProductsOrderBy_PromotionType,
        Middleware.Response.success()
    );

    /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {get} /v1/promotions/list/promotionForUser
         * @apiDescription Get list promotions for user
         * @apiUse authRequest
     */
    router.put(
        '/v1/promotions/stop/:id',
        Middleware.hasRole("admin"),
        promotionController.stopPromotion,
        Middleware.Response.success()
    );

        /**
         * @apiGroup Promotion
         * @apiVersion 1.0.0
         * @api {get} /v1/promotions/checkCodePromotionFreeShip
         * @apiDescription Check code Free ship.
         * @apiUse authRequest
     */
    router.post(
        '/v1/promotions/checkCodePromotionFreeShip',
        Middleware.isAuthenticated,
        promotionController.checkCodePromotionFreeShip,
        Middleware.Response.success()
    );
}