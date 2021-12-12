const walletController = require('../controllers/wallet-controller');

module.exports = (router) => {
    /**
     * @apiGroup User
     * @apiVersion 1.0.0
     * @api {get} /v1/goldtime/wallet The amount money that user has in wallet
     * @apiDescription Get the amount money that user has in wallet
     * @apiUse authRequest
     * @apiSuccessExample {json} Response-Success
     * {
     *    "code": 200,
     *    "message": "OK",
     *    "data": {
     *        "amount": "1977634"
     *    },
     *    "error": false
     * }
     * @apiPermission user
   */
    router.get(
        '/v1/invest/wallet',
        Middleware.isAuthenticated,
        walletController.getWallet,
        Middleware.Response.success('wallet')
    );
   
};