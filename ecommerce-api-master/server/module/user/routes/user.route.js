const multer = require('multer');

const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, '../public/avatar/');
    },
    filename(req, file, cb) {
      const fileName = Helper.String.randomString(5) + Helper.String.getExt(file.originalname);
      cb(null, fileName);
    }
  })
});

const userController = require('../controllers/user.controller');

module.exports = (router) => {
  /**
   * @apiDefine userCreateRequst
   * @apiParam {String}   username   username
   * @apiParam {String}   email      email address
   * @apiParam {String}   password   password
   * @apiParam {String}   [name]
   * @apiParam {String}   [address]
   * @apiParam {String}   [phoneNumber]
   * @apiParam {Boolean}  [phoneVerified]
   * @apiParam {Boolean}  [emailVerified]
   */

  /**
   * @apiDefine userProfileResponse
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "role": "user",
   *        "provider": "local",
   *        "_id": "5b99da5989b54c53851fa66c",
   *        "type": "user",
   *        "isActive": true,
   *        "emailVerified": false,
   *        "phoneNumber": "",
   *        "phoneVerified": false,
   *        "address": "",
   *        "email": "tuongtest@yopmail.com",
   *        "createdAt": "2018-09-13T03:32:41.715Z",
   *        "updatedAt": "2018-09-13T03:32:41.715Z",
   *        "__v": 0,
   *        "avatarUrl": "http://url/to/default/avatar.jpg"
   *    },
   *    "error": false
   * }
   */

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users  Create new user
   * @apiDescription Create new user
   * @apiUse authRequest
   * @apiUse userCreateRequst
   * @apiUse userProfileResponse
   * @apiPermission admin
   */
  router.post(
    '/v1/users',
    Middleware.hasRole('admin'),
    userController.create,
    Middleware.Response.success('user')
  );


  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/shippingAddress Create new shippingAddress of user
   * @apiDescription Create new shippingAddress of user
   * @apiUse authRequest
   * @apiParam {String}   firstName
   * @apiParam {String}   lastName
   * @apiParam {String}   phoneNumber
   * @apiParam {String}   address
   * @apiParam {String}   district
   * @apiParam {String}   ward
   * @apiParam {String}   city
   * @apiParam {String}   zipCode
   * @apiParam {Boolean}  default
   */
  router.post(
    '/v1/users/shippingAddress',
    Middleware.isAuthenticated,
    userController.createShippingAddress,
    Middleware.Response.success()
  )

   /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {put} /v1/users/shippingAddress Update a shippingAddress of user
   * @apiDescription Update a shippingAddress of user
   * @apiUse authRequest
   * @apiParam {String}   id
   * @apiParam {String}   firstName
   * @apiParam {String}   lastName
   * @apiParam {String}   phoneNumber
   * @apiParam {String}   address
   * @apiParam {String}   district
   * @apiParam {String}   ward
   * @apiParam {String}   city
   * @apiParam {String}   zipCode
   * @apiParam {Boolean}  default
   */
  router.put(
    '/v1/users/shippingAddress',
    Middleware.isAuthenticated,
    userController.updateShippingAddress,
    Middleware.Response.success()
  )


  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/shippingAddress/:id Get user shippingAddress by id
   * @apiUse authRequest
   */
  router.get(
    '/v1/users/shippingAddress/:id',
    Middleware.isAuthenticated,
    userController.getShippingAddressById,
    Middleware.Response.success('data')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/shippingAddress/:id Delete a user shippingAddress by id
   * @apiUse authRequest
   */
  router.delete(
    '/v1/users/shippingAddress/:id',
    Middleware.isAuthenticated,
    userController.removeOneShippingAddress,
    Middleware.Response.success('shippingAddressremoved')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/:id/avatar  Change user avatar
   * @apiDescription Change user avatar. Use multipart/formdata
   * @apiUse authRequest
   * @apiParam {Object}  avatar file data
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "url": "http://url/to/avatar.jpg"
   *    },
   *    "error": false
   * }
   * @apiPermission admin
   */
  router.post(
    '/v1/users/:id/avatar',
    Middleware.hasRole('admin'),
    uploadAvatar.single('avatar'),
    userController.updateAvatar,
    Middleware.Response.success('updateAvatar')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/avatar  Change current user avatar
   * @apiDescription Change user avatar. Use multipart/formdata
   * @apiUse authRequest
   * @apiParam {Object}  avatar file data
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "url": "http://url/to/avatar.jpg"
   *    },
   *    "error": false
   * }
   * @apiPermission user
   */
  router.post(
    '/v1/users/avatar',
    Middleware.isAuthenticated,
    uploadAvatar.single('avatar'),
    userController.updateAvatar,
    Middleware.Response.success('updateAvatar')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {put} /v1/users Update current user profile
   * @apiDescription Update profile
   * @apiUse authRequest
   * @apiUse userCreateRequst
   * @apiUse userProfileResponse
   * @apiPermission admin
   */
  router.put(
    '/v1/users',
    Middleware.isAuthenticated,
    userController.update,
    Middleware.Response.success('update')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/:id Update profile
   * @apiDescription Update profile
   * @apiUse authRequest
   * @apiUse userCreateRequst
   * @apiUse userProfileResponse
   * @apiPermission admin
   */
  router.put(
    '/v1/users/:id',
    Middleware.hasRole('admin'),
    userController.update,
    Middleware.Response.success('update')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/me Get my profile
   * @apiDescription get current profle of logged in user
   * @apiUse authRequest
   * @apiUse userProfileResponse
   * @apiPermission user
   */
  router.get(
    '/v1/users/me',
    Middleware.isAuthenticated,
    Middleware.checkPlatform,
    userController.me,
    Middleware.Response.success('me')
  );
  
   /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/social Get current user social
   * @apiDescription get current user social infomation
   * @apiUse authRequest
   * @apiUse userSocialResponse
   * @apiPermission user
   */
  router.get(
    '/v1/users/social',
    Middleware.isAuthenticated,
    userController.getUserSocial,
    Middleware.Response.success('social')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/search?:name&:phoneNumber&:isActive&:phoneVerified&:emailVerified&:role Search users
   * @apiDescription Search users
   * @apiUse authRequest
   * @apiParam {String}   [name]
   * @apiParam {String}   [phoneNumber]
   * @apiParam {Boolean}  [isActive]
   * @apiParam {Boolean}  [phoneVerified]
   * @apiParam {Boolean}  [emailVerified]
   * @apiParam {String}   [role]
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "count": 10,
   *        "items": [
   *            "role": "user",
   *            "provider": "local",
   *            "_id": "5b99da5989b54c53851fa66c",
   *            "type": "user",
   *            "isActive": true,
   *            "emailVerified": false,
   *            "phoneNumber": "",
   *            "phoneVerified": false,
   *            "address": "",
   *            "email": "tuongtest@yopmail.com",
   *            "createdAt": "2018-09-13T03:32:41.715Z",
   *            "updatedAt": "2018-09-13T03:32:41.715Z",
   *            "__v": 0,
   *            "avatarUrl": "http://url/to/default/avatar.jpg"
   *        ]
   *    },
   *    "error": false
   * }
   * @apiPermission admin
   */
  router.get(
    '/v1/users/search',
    Middleware.hasRole('admin'),
    userController.search,
    Middleware.Response.success('search')
  );
  
  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/search?:name&:phoneNumber&:isActive&:phoneVerified&:emailVerified&:role Search users
   * @apiDescription Search users
   * @apiUse authRequest
   * @apiParam {String}   [name]
   * @apiParam {String}   [phoneNumber]
   * @apiParam {Boolean}  [isActive]
   * @apiParam {Boolean}  [phoneVerified]
   * @apiParam {Boolean}  [emailVerified]
   * @apiParam {String}   [role]
   */
  router.get(
    '/v1/users/searchAll',
    Middleware.hasRole('admin'),
    userController.searchAll,
    Middleware.Response.success('searchAll')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/shippingAddress Get user shipping address list
   * @apiDescription Get user shippingAddress list
   * @apiUse authRequest
   * @apiPermission user
   */
  router.get(
    '/v1/users/shippingAddress',
    Middleware.isAuthenticated,
    userController.findUserShippingAddress,
    Middleware.Response.success('shippingAddress')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {get} /v1/users/:id Get user profile
   * @apiDescription Get public user profile
   * @apiUse authRequest
   * @apiParam {String}   [id]      user id
   * @apiUse userProfileResponse
   * @apiPermission user
   */
  router.get(
    '/v1/users/:id',
    Middleware.isAuthenticated,
    userController.findOne,
    Middleware.Response.success('user')
  );


  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {delete} /v1/users/:id Delete user
   * @apiDescription Delete user profile. just allow for non-admin user
   * @apiUse authRequest
   * @apiParam {String}   [id]      user id
   *
   * @apiSuccessExample {json} Response-Success
   * {
   *    "code": 200,
   *    "message": "OK",
   *    "data": {
   *        "success": true
   *    },
   *    "error": false
   * }
   * @apiPermission admin
   */
  router.delete(
    '/v1/users/:userId',
    Middleware.hasRole('admin'),
    userController.remove,
    Middleware.Response.success('remove')
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {delete} /v1/users/:id
   * @apiDescription Update bank information of current user
   * @apiUse authRequest
   * @apiPermission user
  */
  router.post(
    '/v1/users/updateBankInfo',
    Middleware.isAuthenticated,
    userController.updateBankInfo,
    Middleware.Response.success()
  );

  /**
   * @apiGroup User
   * @apiVersion 1.0.0
   * @api {post} /v1/users/updateCouponCodes
   * @apiDescription Add coupon codes of current user
   * @apiUse authRequest
   * @apiPermission user
  */
  router.post(
    '/v1/users/addCouponCodes',
    Middleware.isAuthenticated,
    userController.addCouponCodes,
    Middleware.Response.success('coupon_code')
  );

  /**
   * @apiGroup updateEmailPhone
   * @apiVersion 1.0.0
   * @api {post} /v1/users/updateEmailPhone
   * @apiDescription Add updateEmailPhone
   * @apiUse authRequest
   * @apiPermission user
  */
   router.post(
    '/v1/users/updateEmailPhone',
    Middleware.isAuthenticated,
    userController.updateEmailPhone,
    Middleware.Response.success('updateEmailPhone')
  );
};
