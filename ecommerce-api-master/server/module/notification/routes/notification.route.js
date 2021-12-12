const notiController = require('../controllers/notification.controller');

module.exports = (router) => {

    /**
     * @apiGroup Notification
     * @apiVersion 1.0.0
     * @api {post} /v1/notification/sendSms Send SMS
     * @apiDescription Call send sms to user phone number from Invest
     * @apiUse authRequest
     * @apiParam {String} phoneNumber user's phone number
     * @apiParam {String} smsMessage sms message content
     *
     * @apiPermission user
     */
    router.post(
        '/v1/notification/sendSms',
        Middleware.isAuthenticated,
        notiController.sendSms,
        Middleware.Response.success()
    );


    /**
     * @apiGroup Notification
     * @apiVersion 1.0.0
     * @api {post} /v1/notification/sendEmail Send email
     * @apiDescription Call send email to user from Invest
     * @apiUse authRequest
     * @apiParam {String} subject user's phone number
     * @apiParam {String} content sms message content
     *
     * @apiPermission user
     */
    router.post(
        '/v1/notification/sendEmail',
        Middleware.isAuthenticated,
        notiController.sendEmail,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Notification
     * @apiVersion 1.0.0
     * @api {post} /v1/notification/insertNotification insert noti
     * @apiDescription test insert noti
     * @apiUse authRequest
     *
     * @apiPermission user
     */
    router.post(
        '/v1/notification/insertNotification',
        Middleware.isAuthenticated,
        notiController.insertNotification,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Read Notification
     * @apiVersion 1.0.0
     * @api {get} /v1/notification/readNotification
     * @apiDescription read noti
     * @apiUse authRequest
     * @apiParam id {String} id of notification you read
     * @apiPermission user
     */
    router.get(
        '/v1/notification/readNotification',
        Middleware.isAuthenticated,
        notiController.readNotification,
        Middleware.Response.success()
    );

    /**
     * @apiGroup Read News Notification
     * @apiVersion 1.0.0
     * @api {get} /v1/notification/readNotification
     * @apiDescription read noti
     * @apiUse authRequest
     * @apiParam id {String} id of notification you read
     * @apiPermission user
     */
    router.get(
        '/v1/notification/readNewsNotification',
        Middleware.isAuthenticated,
        notiController.readNewsNotification,
        Middleware.Response.success()
    );

    /**
     * @apiGroup count unread notification
     * @apiVersion 1.0.0
     * @api {get} /v1/notification/countUnReadNotification
     * @apiDescription read noti
     * @apiUse authRequest
     * @apiPermission user
     */
    router.get(
        '/v1/notification/countUnReadNotification',
        Middleware.isAuthenticated,
        notiController.countUnReadNotification,
        Middleware.Response.success()
    );

    /**
     * @apiGroup count unread notification
     * @apiVersion 1.0.0
     * @api {get} /v1/notification/countUnReadNotification
     * @apiDescription read noti
     * @apiUse authRequest
     * @apiPermission user
     */
    router.get(
        '/v1/notification/getListNotification',
        Middleware.isAuthenticated,
        notiController.listNotification,
        Middleware.Response.success()
    );
};
