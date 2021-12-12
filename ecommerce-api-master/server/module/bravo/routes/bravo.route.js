const bravoController = require('../controllers/bravo.controller');

module.exports = (router) => {

    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDAuthen
     * @apiDescription login WCD
     * @apiPermission admin
     */
    router.post(
        '/v1/bravo/WCDAuthen',
        Middleware.hasRole('admin'),
        bravoController.WCDAuthen,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDClearSession
     * @apiDescription clear session WCD
     * @apiPermission admin
     */
    router.get(
        '/v1/bravo/WCDClearSession',
        Middleware.hasRole('admin'),
        bravoController.WCDClearSession,
        Middleware.Response.success()
    );
    
    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDWritePO
     * @apiDescription Save order to bravo server
     * @apiPermission admin
     */
    router.post(
        '/v1/bravo/WCDWritePO',
        Middleware.hasRole('admin'),
        bravoController.WCDWritePO,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDWritePODetail
     * @apiDescription Save order detail to bravo server
     * @apiPermission admin
     */
    router.post(
        '/v1/bravo/WCDWritePODetail',
        Middleware.hasRole('admin'),
        bravoController.WCDWritePODetail,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDGetPODocNo
     * @apiDescription Get bizDocId from WCD
     * @apiPermission admin
     */
    router.post(
        '/v1/bravo/WCDGetPODocNo',
        Middleware.hasRole('admin'),
        bravoController.WCDGetPODocNo,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDCheckPODocNo
     * @apiDescription Check bizDocId
     * @apiPermission admin
     */
    router.post(
        '/v1/bravo/WCDCheckPODocNo',
        Middleware.hasRole('admin'),
        bravoController.WCDCheckPODocNo,
        Middleware.Response.success()
    );

     /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/SyncOrderDataToBravo
     * @apiDescription Send data to WCD
     * @apiPermission admin
     */
    router.post(
        '/v1/bravo/SendOrderDataToBravo',
        Middleware.hasRole('admin'),
        bravoController.SendOrderDataToBravo,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDLoadPOInfo
     * @apiDescription Get bravo order
     * @apiPermission admin
     */
    router.get(
        '/v1/bravo/WCDLoadPOInfo',
        Middleware.hasRole('admin'),
        bravoController.WCDLoadPOinfo,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Bravo
     * @apiVersion 1.0.0
     * @api {get} /v1/bravo/WCDLoadPOInfoDetail
     * @apiDescription Get bravo order detail
     * @apiPermission admin
     */
    router.get(
        '/v1/bravo/WCDLoadPOInfoDetail',
        Middleware.hasRole('admin'),
        bravoController.WCDLoadPOinfoDetail,
        Middleware.Response.success()
    );
}