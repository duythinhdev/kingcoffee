const kpiController = require("../controllers/kpi.controller");

module.exports = (router) => {
    /**
     * @apiGroup KPI
     * @apiVersion 1.0.0
     * @api {put} /v1/kpi/insertMonthKPI
     * @apiDescription Insert month kpi for all user
     * @apiUse authRequest
     * @apiPermission admin
     */
    router.post(
        '/v1/kpi/insertMonthKPI',
        Middleware.hasRole('admin'),
        kpiController.insertMonthKPI,
        Middleware.Response.success()
    );

    /**
     * @apiGroup KPI
     * @apiVersion 1.0.0
     * @api {get} /v1/kpi?:sort&:sortType&:page&:take&:memberId&:startMonth&:endMonth
     * @apiDescription Get list kpi of current customer. Or all if admin
     * @apiUse authRequest
     * @apiPermission user or admin
     */
    router.get(
        '/v1/kpi',
        Middleware.isAuthenticated,
        kpiController.list,
        Middleware.Response.success('list')
    );

    /**
     * @apiGroup KPI
     * @apiVersion 1.0.0
     * @api {get} /v1/getCurrentKPI
     * @apiDescription Get current kpi of this user
     * @apiUse authRequest
     * @apiPermission user
     */
    router.get(
        '/v1/getCurrentKPI',
        Middleware.isAuthenticated,
        kpiController.currentKPI,
        Middleware.Response.success('kpi')
    );
}