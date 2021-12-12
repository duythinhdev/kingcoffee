const wheelController = require('../controllers/wheel.controller');
module.exports = (router) => {
  /**
   * @apiGroup Wheel
   * @apiVersion 1.0.0
   * @api {post} /v1/wheel/result Get wheel result
   * @apiDescription Get wheel result
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "result": [one value between 1 - 7]
   *     },
   *     "error": false
   *  }
   * @apiPermission seller
   */
   router.post(
    '/v1/wheel/result',
    Middleware.isAuthenticated,
    wheelController.getResult,
    Middleware.Response.success('wheel')
  );

  router.get(
    '/v1/wheel/start-date',
    wheelController.getStartDate,
    Middleware.Response.success('wheel')
  )
}
