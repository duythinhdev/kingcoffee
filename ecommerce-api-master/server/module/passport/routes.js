const authController = require('./auth.controller');
const facebookController = require('./social/facebook');
const investController = require('./social/invest');
const googleController = require('./social/google');
const appleController = require('./social/apple');
const localController = require('./local');

module.exports = (router) => {
  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/login  Local login
   * @apiDescription Login with email and password
   * @apiParam {String}   username   username
   * @apiParam {String}   password   password
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
   *         "expiredAt": "2018-09-14T06:39:18.140Z"
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
  // router.post(
  //   '/v1/auth/login',
  //   localController.login,
  //   Middleware.Response.success('login')
  // );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/login  Local with invest
   * @apiDescription Local with invest. User in the client side MUST have scope for email
   * @apiParam {String}   username      username
   * @apiParam {String}   password      password
   * @apiParam {String}   [twoFaCode]   invest two factor authen code
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
   *         "expiredAt": "2018-09-14T06:39:18.140Z"
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
  router.post(
    '/v1/auth/login',
    //Middleware.checkPlatform,
    investController.login,
    Middleware.Response.success('login')
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/login/facebook  Local with facebook
   * @apiDescription Local with facebook. User in the client side MUST have scope for email
   * @apiParam {String}   accessToken Access token
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
   *         "expiredAt": "2018-09-14T06:39:18.140Z"
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
  router.post(
    '/v1/auth/login/facebook',
    facebookController.login,
    Middleware.Response.success('login')
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/login/google  Local with google
   * @apiDescription Local with google. User in the client side MUST have scope for email
   * @apiParam {String}   accessToken Access token
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
   *         "expiredAt": "2018-09-14T06:39:18.140Z"
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
  router.post(
    '/v1/auth/login/google',
    googleController.login,
    Middleware.Response.success('login')
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/login/apple  Local with apple
   * @apiDescription Local with apple. User in the client side MUST have scope for email
   * @apiParam {String}   accessToken Access token
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
   *         "expiredAt": "2018-09-14T06:39:18.140Z"
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
   router.post(
    '/v1/auth/login/apple',
    appleController.login,
    Middleware.Response.success('login')
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/register  Register new account
   * @apiDescription Login with email and password
   * @apiParam {String}   email      email address
   * @apiParam {String}   password   password
   * @apiParam {String}   [phoneNumber]  phone number
   * @apiParam {String}   [name] user name
   * @apiSuccessExample {json} Success-Response:
   *  {
   *      "code": 200,
   *       "message": "OK",
   *      "data": {
   *           "code": 200,
   *           "httpCode": 200,
   *           "error": false,
   *           "message": "USE_CREATED",
   *           "data": {
   *               "message": "Your account has been created, please verify your email address and get access."
   *           }
   *       },
   *       "error": false
   *  }
   * @apiPermission all
   */
  router.post(
    '/v1/auth/register',
    authController.register,
    Middleware.Response.success('register')
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/verifyEmail  Verify email address
   * @apiDescription Verify email address
   * @apiParam {String}   token verification token which sent to email
   * @apiSuccessExample {json} Success-Response:
   *  {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *      "code": 200,
   *      "httpCode": 200,
   *      "error": false,
   *      "message": "EMAIL_VERIFIED",
   *      "data": {
   *        "message": "Your email has been verified."
   *       }
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
  router.post(
    '/v1/auth/verifyEmail',
    authController.verifyEmail,
    Middleware.Response.success('verifyEmail')
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {get} /v1/auth/verifyEmail/:token  Verify email address
   * @apiDescription Render HTML view
   * @apiParam {String}   token verification token which sent to email
   * @apiPermission all
   */
  router.get(
    '/v1/auth/verifyEmail/:token',
    authController.verifyEmailView
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/forgot  Forgot password
   * @apiDescription Send forgot password to email
   * @apiParam {String}   email      email address
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "code": 200,
   *         "httpCode": 200,
   *         "error": false,
   *         "message": "FORGOT_PASSWORD_EMAIL_SENT",
   *         "data": {
   *             "message": "Your password email has been sent."
   *         }
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
  router.post(
    '/v1/auth/forgot',
    authController.forgot,
    Middleware.Response.success('forgot')
  );

  /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {get} /v1/auth/passwordReset/:token  Open view for password reset
   * @apiDescription  Open view for password reset
   * @apiParam {String}   token password reset token
   * @apiPermission all
   */
  router.use(
    '/v1/auth/passwordReset/:token',
    authController.resetPasswordView
  );

    /**
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @api {post} /v1/auth/callback  Local with invest
   * @apiDescription Callback from invest login. Save user info and return nodejs token.
   * @apiParam {String}   accpet      token
   * @apiSuccessExample {json} Success-Response:
   *  {
   *     "code": 200,
   *     "message": "OK",
   *     "data": {
   *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
   *         "expiredAt": "2018-09-14T06:39:18.140Z"
   *     },
   *     "error": false
   *  }
   * @apiPermission all
   */
  router.post(
    '/v1/auth/callback',
    investController.investLoginCallBack,
    Middleware.Response.success('login')
  );
};
