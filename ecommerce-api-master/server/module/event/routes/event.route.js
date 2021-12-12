const fs = require('fs');
const multer = require('multer');

const eventController = require('../controllers/event.controller');

const excelDir = '../public/files/excels';
// create folder
fs.promises.mkdir(excelDir, { recursive: true });

const uploadExcel = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, excelDir);
    },
    filename(req, file, cb) {
      const ext = Helper.String.getExt(file.originalname);
      const nameWithoutExt = Helper.String.createAlias(Helper.String.getFileName(file.originalname, true));
      const fileName = `${nameWithoutExt}-${Helper.String.randomString(5)}${ext}`;

      cb(null, fileName);
    },
    fileSize: (process.env.MAX_PHOTO_SIZE || 10) * 1024 * 1024 // 10MB limit
  })
});

module.exports = (router) => {
  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {post} /v1/event Buy five element ticket
   * @apiDescription Buy five element ticket
   * @apiParam {String}   productId productId of products
   * @apiParam {Number}   quantity quantity of products
   * @apiParam {String}   [username] username of user
   *
   * @apiPermission admin
   */
  router.post(
    '/v1/event',
    Middleware.isAuthenticated,
    eventController.create,
    Middleware.Response.success('create')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {get} /v1/event/search?page&take&ownerName&parentName&sponsorName?code Find ticket
   * @apiDescription Search event(ticket) by condition.
   * @apiParam {String}   [ownerName] owner GoldTime username
   * @apiParam {String}   [parentName] parent GoldTime username
   * @apiParam {String}   [sponsorName] sponsor GoldTime username
   * @apiParam {String}   [code] ticket code
   * @apiParam {Number}   [take] limit default 10
   * @apiParam {Number}   [page] page default 1
   *
   * @apiPermission admin
   */
  router.get(
    '/v1/event/search',
    Middleware.hasRole('admin'),
    eventController.search,
    Middleware.Response.success('search')
  );

  /**
  * @apiGroup Event
  * @apiVersion 1.0.0
  * @api {get} /v1/event/getBuyTicketTotalInfo
  * @apiDescription Search total price and total commission event(ticket).
  *
  * @apiPermission admin
  */
  router.get(
    '/v1/event/getBuyTicketTotalInfo',
    Middleware.hasRole('admin'),
    eventController.getTotalInfo,
    Middleware.Response.success('data')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {get} /v1/event/randomWinner Generate a random winner
   * @apiDescription Generate a random winner.
   * @apiParam {String}   productId product id has fiveelement type
   *
   * @apiPermission admin
   */
  router.get(
    '/v1/event/randomWinner',
    Middleware.hasRole('admin'),
    eventController.getRandomWinner,
    Middleware.Response.success('data')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {get} /v1/event/resend-mail Resend Mail
   * @apiDescription Resend Mail.
   * @apiParam {String}   productId product id has fiveelement type
   * @apiParam {String}   username username GoldTime username
   *
   * @apiPermission admin
   */
  router.get(
    '/v1/event/resend-mail',
    eventController.resendMail,
    Middleware.Response.success('resendMail')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {get} /v1/event/winners List users winner
   * @apiDescription List users winner.
   * @apiUse authRequest
   * @apiParam {String}   [page] page number page
   * @apiParam {String}   [take] take number take
   * @apiParam {String}   [username] username of user
   * @apiParam {String}   [code] code of event winner
   * @apiParam {String}   [startDate] start time in UTC format
   * @apiParam {String}   [toDate] to time in UTC format
   *
   * @apiPermission admin
   */
  router.get(
    '/v1/event/winners',
    Middleware.hasRole('admin'),
    eventController.eventWinnerList,
    Middleware.Response.success('list')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {get} /v1/event/winners/:id Get users winner by id
   * @apiDescription Update users winner.
   * @apiUse authRequest
   *
   * @apiPermission admin
   */
  router.get(
    '/v1/event/winners/:id',
    Middleware.hasRole('admin'),
    eventController.eventWinnerDetail,
    Middleware.Response.success('detail')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {put} /v1/event/winners/:id Update users winner
   * @apiDescription Update users winner.
   * @apiUse authRequest
   * @apiParam {String}   description information update
   *
   * @apiPermission admin
   */
  router.put(
    '/v1/event/winners/:id',
    Middleware.hasRole('admin'),
    eventController.eventWinnerUpdate,
    Middleware.Response.success('update')
  );

    /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {get} /v1/event/seller/winner List users winner of seller's event product
   * @apiDescription List users winner of seller's event product.
   * @apiUse authRequest
   * @apiParam {String}   [page] page number page
   * @apiParam {String}   [take] take number take
   * @apiParam {String}   [username] username of user
   * @apiParam {String}   [code] code of event winner
   * @apiParam {String}   [startDate] start time in UTC format
   * @apiParam {String}   [toDate] to time in UTC format
   * @apiParam {String}   [sellerId] seller Id
   * 
   * @apiPermission seller
   */
  router.get(
    '/v1/event/seller/winners',
    Middleware.hasRole('seller'),
    eventController.eventWinnerListOfSeller,
    Middleware.Response.success('list')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {post} /v1/event/upload  Upload a file excel
   * @apiDescription Upload a photo. Use multipart/form-data to upload file and add additional fields
   * @apiUse authRequest
   * @apiParam {Object}   file  file data
   * @apiPermission admin
   */
  router.post(
    '/v1/event/upload',
    Middleware.isAuthenticated,
    uploadExcel.single('file'),
    eventController.uploadExcel,
    Middleware.Response.success('excel')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {get} v1/event/voucher  Get voucher
   * @apiDescription Get voucher
   *
   * @apiParam {username}   [username]  username
   * @apiParam {tiketCode}   [tiketCode]  tiketCode
   * @apiParam {voucher}   [voucher]  voucher
   * @apiPermission user
   */
  router.get(
    '/v1/event/voucher',
    eventController.getVoucher,
    Middleware.Response.success('data')
  );

  /**
   * @apiGroup Event
   * @apiVersion 1.0.0
   * @api {post} v1/event/voucher/payment  Payment event
   * @apiDescription Payment event
   *
   * @apiParam {username}   [username]  username
   * @apiParam {tiketCode}   [tiketCode]  tiketCode
   * @apiParam {voucher}   [voucher]  voucher
   * @apiPermission user
   */
  router.post(
    '/v1/event/voucher/payment',
    Middleware.isAuthenticated,
    eventController.payment,
    Middleware.Response.success('data')
  );
};
