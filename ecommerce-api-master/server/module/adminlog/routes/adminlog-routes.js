const adminActionLogs = require('../controllers/adminlog-controller');
module.exports = router => {
    /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/search?:page&:take&:action&:text Search users
   * @apiDescription Search users
   * @apiUse authRequest
   * @apiParam {String}   [page]
   * @apiParam {String}   [take]
   * @apiParam {String}   [username]
   * @apiParam {String}   [action]
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": [
   *         "count": 1,
   *         "admin_action_logs": [
   *            {
   *              "_id": "5e7da9d8fee5277843b65dd2",
   *              "text": "Admin đã kích hoạt sản phẩm",
   *              "username": "congphuong02",
   *              "action": "Chỉnh Sửa",
   *              "createdAt": "2020-03-27T06:55:08.088Z",
   *              "updatedAt": "2020-03-27T06:55:08.088Z",
   *              "id": "5e7da9d8fee5277843b65dd2"
   *            },
   *         ]
   *    ]
   * }
   * 
   * @apiPermission admin
   */
  router.get(
    '/v1/admin/action/logs',
    Middleware.isAuthenticated,
    adminActionLogs.getAdminActionLogsList,
    Middleware.Response.success('admin_action_logs')
  );
};

