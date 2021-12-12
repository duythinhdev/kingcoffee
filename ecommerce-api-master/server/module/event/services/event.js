/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const numeral = require('numeral');
const _ = require('lodash');
const Excel = require('exceljs');
const redis = require('redis');
const Queue = require('../../../kernel/services/queue');

const sendMail = Queue.create('send-mail-nhts');
const SITE_CURRENCY = process.env.SITE_CURRENCY || 'VND';

const portRedis = process.env.REDIS_PORT || 6379;
const hostRedis = process.env.REDIS_HOST || '127.0.0.1';
const redisClient = redis.createClient(portRedis, hostRedis);

exports.createEventRequest = async ({
  ownerId,
  ownerName,
  email,
  params
}) => {
  try {
    const productId = Helper.App.isMongoId(params.productId) ? params.productId : Helper.App.toObjectId(params.productId);

    const [product, userToken] = await Promise.all([
      DB.Product.findOne({
        _id: productId
      }).populate('shop').populate('mainImage'),
      Service.User.GetGoldtimeLatestAccessToken(ownerId)
    ]);

    const walletAmount = await Service.Wallet.getWalletAmount(userToken);
    const checkPrice = product.salePrice || product.price;
    if (walletAmount.StatusCode !== 200) {
      throw new Error(walletAmount.Message);
    } else if (walletAmount.Data.Wallet < checkPrice) {
      throw new Error('Tài khoản không đủ tiền');
    }

    const socialId = await DB.UserSocial.findOne({
      userId: ownerId
    }, {
      socialId: 1,
      _id: 0
    });
    if (!socialId) {
      await Service.Logger.createEvent({
        level: 'socialId',
        path: '/v1/event',
        error: 'get socialId fail',
        username: ownerName,
        status: 3
      });
      return false;
    }
    await Service.Logger.createEvent({
      level: 'insertEvent',
      path: '/v1/event',
      error: 'insert event log',
      body: {
        ownerId: parseInt(socialId.socialId, 10),
        ownerName,
        sponsorTicketCode: params.code
      },
      username: ownerName
    });
    // insert event
    const insertEvent = await Service.RequestNHTS.insertEvent({
      ownerId: parseInt(socialId.socialId, 10),
      ownerName,
      sponsorTicketCode: params.code
    });
    if (!insertEvent || insertEvent.statusCode !== 200) {
      await DB.LogEvent.findOneAndUpdate({
        username: ownerName
      }, {
        $set: {
          reqBody: insertEvent,
          status: 3
        }
      });
      return false;
    }

    await DB.LogEvent.findOneAndUpdate({
      username: ownerName
    }, {
      $set: {
        reqBody: insertEvent,
        status: 2
      }
    });

    // get list user
    const getUpline = await Service.RequestNHTS.getUpline(parseInt(socialId.socialId, 10));
    if (!getUpline || getUpline.statusCode !== 200) {
      await Service.Logger.createEvent({
        level: 'getUpline',
        path: '/v1/event',
        error: 'get getUpline fail',
        body: getUpline,
        username: ownerName
      });
      return false;
    }

    const userCurrency = SITE_CURRENCY;
    const currencyExchangeRate = 1;

    const customerInfo = _.pick(params, [
      'phoneNumber',
      'firstName',
      'lastName',
      'email',
      'city',
      'district',
      'ward',
      'streetAddress',
      'userIP',
      'userAgent'
    ]);

    const order = new DB.Order(Object.assign(customerInfo, {
      customerId: ownerId,
      currency: SITE_CURRENCY,
      trackingCode: [],
      userCurrency,
      currencyExchangeRate,
      paymentMethod: 'Ví GoldTime',
      paymentStatus: 'Thành công'
    }));

    let totalProducts = 0;
    let totalPrice = 0;

    let errorMessage = '';

    let taxPrice = 0;
    const unitPrice = product.salePrice || product.price;

    const affLink = await Service.Event.generateAFFLink(productId, insertEvent.data);
    const orderDetail = new DB.OrderDetail(Object.assign(customerInfo, {
      orderId: order._id,
      customerId: ownerId,
      shopId: product.shopId,
      productId: product._id,
      productVariantId: product.productVariantId,
      userNote: product.userNote,
      trackingCode: '',
      quantity: params.quantity,
      unitPrice,
      currency: SITE_CURRENCY,
      productDetails: product, // TODO - just pick go needed field
      userCurrency,
      currencyExchangeRate,
      shippingMethod: '',
      ticketCode: insertEvent.data,
      AFFLink: affLink
    }));

    if (product.stockQuantity < orderDetail.quantity) {
      let msg =
        `Sản phẩm '${product.name}' số lượng chỉ còn ${product.stockQuantity}` +
        ',';

      if (product.stockQuantity === 0) {
        msg =
          `Sản phẩm '${product.name}' đã hết hàng, `;
      }

      errorMessage += msg;
    }

    if (errorMessage !== '') {
      throw new Error(errorMessage.substring(
        0,
        errorMessage.length - 1
      ));
    }

    taxPrice = product.taxPercentage ?
      unitPrice * (product.taxPercentage / 100) :
      0;
    orderDetail.taxPrice = taxPrice * params.quantity;
    orderDetail.taxClass = product.taxClass;
    orderDetail.taxPercentage = product.taxPercentage;
    orderDetail.userTaxPrice =
      taxPrice * currencyExchangeRate * params.quantity;

    const productPrice = unitPrice * params.quantity;
    totalProducts += params.quantity;

    orderDetail.productPrice = productPrice;
    orderDetail.totalPrice =
      Math.round((productPrice + orderDetail.taxPrice) * 100) / 100; // TODO - round me

    totalPrice += orderDetail.totalPrice;
    orderDetail.userTotalPrice =
      orderDetail.totalPrice * currencyExchangeRate;

    order.totalProducts = totalProducts;
    order.totalPrice = totalPrice;
    order.userTotalPrice = totalPrice * currencyExchangeRate;

    const [rsOrder, rsOrderDetail] = await Promise.all([
      order.save(),
      orderDetail.save()
    ]);

    // Call payment goldtime
    const listUser = getUpline.data.str.split(',').map(item => parseInt(item, 10));
    const paymentResponse = await Service.Wallet.buyFiveelementTicket(listUser, 0, userToken);

    // Rollback
    if (!rsOrder || !rsOrderDetail || paymentResponse.StatusCode !== 200) {
      await Promise.all([
        DB.Order.findByIdAndDelete(order._id),
        DB.OrderDetail.findByIdAndDelete(orderDetail._id)
      ]);

      if (paymentResponse.StatusCode !== 200) {
        await DB.LogEvent.findOneAndUpdate({
          username: ownerName
        }, {
          $set: {
            status: 3
          }
        });

        await Service.Mailer.send(
          'event/buy-five-element-ticket-fail.html',
          email, {
          subject: 'Mua vé ngũ hành tương sinh không thành công',
        }
        );

        const sendMailDev = await Service.Event.getRedisData('mail-develop');
        if (sendMailDev === 'true') {
          await Service.Mailer.send(
            'event/buy-five-element-ticket-fail.html',
            process.env.SEND_MAIL_DEV, {
            subject: 'Mua vé ngũ hành tương sinh không thành công',
          }
          );
        }
      }

      return false;
    }

    // update quantity and numberChild
    await Promise.all([
      Service.Product.updateQuantity({
        productId: product._id,
        productVariantId: null,
        quantity: params.quantity
      }),

      await DB.LogEvent.findOneAndUpdate({
        username: ownerName
      }, {
        $set: {
          status: 2
        }
      })
    ]);

    this.sendEmailBuyTicketSuccess(product._id, insertEvent.data, ownerName);

    return true;
  } catch (e) {
    throw e;
  }
};

exports.initEventRootNode = async (data) => {
  try {
    const productId = Helper.App.isMongoId(data.productId) ? data.productId : Helper.App.toObjectId(data.productId);
    const ownerId = Helper.App.isMongoId(data.ownerId) ? data.ownerId : Helper.App.toObjectId(data.ownerId);
    const {
      username
    } = await DB.User.findOne({
      _id: ownerId
    }, {
      username: 1
    });
    const event = await DB.Event.countDocuments({
      productId,
      sponsorId: null,
      parentId: null
    }); // get node root
    if (event > 0) {
      throw new Error('Sự kiện này đã có nhánh gốc');
    }
    return await DB.Event.create({
      productId,
      ownerId,
      ownerName: username,
      parentId: null,
      parentName: null,
      sponsorId: null,
      sponsorName: null,
      status: 1
    });
  } catch (error) {
    throw error;
  }
};

exports.generateAFFLink = async (productId, code) => {
  try {
    // const node = await DB.Event.findOne({
    //   productId,
    //   code
    // });

    // if (!node) {
    //   throw new Error('Người dùng chưa mua vé sự kiện. Không thể tạo đường dẫn AFF.');
    // }

    return `${process.env.NHTS_WEB}/ngu-hanh-tuong-sinh?ticketcode=${code}`;
  } catch (e) {
    throw e;
  }
};

sendMail.process(async (job, done) => {
  try {
    const data = job.data;
    if (data.action !== 'sendEmailBuyTicketSuccess') {
      // not support yet
      return done();
    }

    const ticket = await DB.Product.findOne({
      _id: data.productId
    });

    const user = await DB.User.findOne({
      username: data.ownerName
    });
    const affLink = await Service.Event.generateAFFLink(data.productId, data.code);
    const price = `${numeral(ticket.salePrice || ticket.Price).format('0,0')} đ`;

    const cacheRedis = await Service.Event.getRedisData('cache-sendMail');
    if (cacheRedis === 'true') {
      await Service.Mailer.send(
        'event/buy-five-element-ticket-success.html',
        user.email, {
        subject: `Chúc mừng mua thành công vé Ngũ Hành Tương Sinh (${data.code})`,
        data: {
          username: user.username,
          ticketName: ticket.name,
          code: data.code,
          affLink,
          ticketPrice: price
        }
      }
      );
    }

    return done();
  } catch (e) {
    await Service.Logger.create({
      level: 'error',
      path: 'send-buy-ticket-success-email',
      error: e
    });

    return done();
  }
});

exports.sendEmailBuyTicketSuccess = async (productId, code, ownerName) => {
  try {
    return sendMail
      .createJob({
        action: 'sendEmailBuyTicketSuccess',
        productId,
        code,
        ownerName
      })
      .save();
  } catch (e) {
    throw e;
  }
};

async function readFileExcel(filename) {
  try {
    const workbook = new Excel.Workbook();

    // read file
    await workbook.xlsx.readFile(filename);
    // get first sheet
    const worksheet = workbook.getWorksheet(1);
    const data = [];
    worksheet.eachRow({
      includeEmpty: true
    }, async (row, rowNumber) => {
      const currRow = worksheet.getRow(rowNumber + 1);
      let obj = {};
      if (currRow.getCell(1).value) {
        obj = {
          username: currRow.getCell(1).value
        };
        if (currRow.getCell(2).value) {
          obj = Object.assign(obj, {
            code: currRow.getCell(2).value
          });
        }
        data.push(obj);
      }
    });

    return data;
  } catch (e) {
    throw e;
  }
}

async function rollback() {
  try {
    await Promise.all([
      DB.Event.findOneAndUpdate({
        level: 1
      }, {
        $set: {
          numberChild: 0
        }
      }),
      DB.Event.remove({
        level: {
          $gt: 1
        }
      })
    ]);
  } catch (e) {
    throw e;
  }
}

exports.import = async ({
  file
}) => {
  try {
    const [product, data, getTree] = await Promise.all([
      DB.Product.findOne({
        fiveElement: true
      }).sort({
        createAt: -1
      }),
      readFileExcel(file.path),
      Service.RequestNHTS.getList({
        level: -1,
        pageNumber: 1,
        pageSize: 2
      })
    ]);

    const msg = [];

    if (getTree && getTree.length > 1) {
      return {
        isImport: true
      };
    }

    for (const item of data) {
      let isError = false;
      const isUser = await DB.User.findOne({
        username: item.username
      });

      if (!isUser) {
        msg.push(`Username: ${item.username} chưa đăng nhập vào hệ thống`);
        isError = true;
      }

      if (!isError) {
        const socialId = await DB.UserSocial.findOne({
          userId: isUser._id
        }, {
          socialId: 1,
          _id: 0
        });

        await Service.Logger.createEvent({
          level: 'insertEvent',
          path: '/v1/event',
          error: 'insert event log',
          body: {
            ownerId: parseInt(socialId.socialId, 10),
            ownerName: item.username,
            sponsorTicketCode: 10000
          },
          username: item.username
        });

        // insert event
        const insertEvent = await Service.RequestNHTS.insertEvent({
          ownerId: parseInt(socialId.socialId, 10),
          ownerName: item.username,
          sponsorTicketCode: 10000
        });

        if (!insertEvent || insertEvent.statusCode !== 200) {
          await DB.LogEvent.findOneAndUpdate({
            username: item.username
          }, {
            $set: {
              reqBody: insertEvent,
              status: 3
            }
          });
        } else {
          await DB.LogEvent.findOneAndUpdate({
            username: item.username
          }, {
            $set: {
              reqBody: insertEvent,
              status: 2
            }
          });
        }
        // const obj = {
        //   ownerId: isUser._id,
        //   ownerName: isUser.username,
        //   code: insertEvent.data,
        //   status: true
        // };

        // await DB.Event.create(obj);
        // if (insertEvent) {
        //   this.sendEmailBuyTicketSuccess(product._id, insertEvent.data, item.username);
        // }
      }
    }

    if (msg.length > 0) {
      return {
        code: 400,
        msg
      };
    }

    return true;
  } catch (e) {
    throw e;
  }
};

exports.getRedisData = async (redisKey) => {
  try {
    return new Promise((resolve, reject) =>
      redisClient.get(redisKey, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }));
  } catch (e) {
    throw e;
  }
};

exports.setRedisData = ({
  key,
  expire,
  data
}) => {
  try {
    if (expire) {
      redisClient.setex(key, expire, data);
    } else {
      redisClient.set(key, data);
    }
  } catch (e) {
    throw e;
  }
};