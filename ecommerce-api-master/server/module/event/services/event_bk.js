/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const numeral = require('numeral');
const _ = require('lodash');
const Excel = require('exceljs');
const redis = require('redis');
const cron = require('node-cron');
const Queue = require('../../../kernel/services/queue');

const eventQ = Queue.create('nhts');
const sendMail = Queue.create('send-mail-nhts');
const SITE_CURRENCY = process.env.SITE_CURRENCY || 'VND';
const MAX_CHILD = 5;
const ROOT_LEVEL = 1;

const portRedis = process.env.REDIS_PORT || 6379;
const hostRedis = process.env.REDIS_HOST || '127.0.0.1';
const redisClient = redis.createClient(portRedis, hostRedis);
const TIME_OUT = process.env.TIME_OUT || 5000;
const LIMIT_REQUEST = process.env.LIMIT_REQUEST || 10;
const SERVER_PRODUCTION = process.env.SERVER_PRODUCTION;

async function getRootUser(shopId, code) {
  try {
    let data = {};

    if (code) {
      const user = await DB.Event.findOne({
        code
      }).populate('owner');
      data = {
        _id: user.ownerId,
        username: user.owner.username
      };
    } else {
      const user = await DB.Shop.findOne({
          _id: shopId
        }, {
          ownerId: 1,
          _id: 0
        })
        .populate('owner');
      data = {
        _id: user.ownerId,
        username: user.owner.username
      };
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function loopEvent(parentId, tree = 1, data = [], maxTree = 10) {
  try {
    const arr = data;
    let key = tree;
    if (maxTree < tree) return arr;

    const result = await DB.Event.findOne({
      ownerId: parentId
    }, {
      parentId: 1,
      ownerId: 1,
      _id: 0
    });
    const {
      socialId
    } = await DB.UserSocial.findOne({
      userId: result.ownerId
    }, {
      socialId: 1,
      _id: 0
    });

    if (socialId) {
      arr.push(parseInt(socialId, 10));
      if (result.parentId) {
        await loopEvent(result.parentId, key += 1, arr);
      }
    }

    return arr;
  } catch (error) {
    throw error;
  }
}

async function loopTree(data = []) {
  try {
    let getOne = null;
    let list = [...data];
    for (const item of data) {
      getOne = await DB.Event.findOne({
        parentId: item.ownerId,
        numberChild: {
          $lt: MAX_CHILD
        }
      }).sort({
        level: 1,
        createAt: 1
      });

      if (getOne) {
        list = null;
        break;
      } else {
        list = list.concat(await DB.Event.find({
          parentId: item.ownerId
        }));
      }
    }

    if (!getOne) getOne = loopTree(list);

    return getOne;
  } catch (e) {
    throw e;
  }
}

eventQ.process(async (job, done) => {
  try {
    const {
      userId,
      ownerName,
      params,
      action,
      product,
      codeSpin,
      email
    } = job.data;
    const {
      quantity,
      code
    } = params;

    if (action !== 'buyTicketFiveElement') {
      // not support yet
      return done();
    }

    /**
     * Get list user
     * ---STRAT---
     */
    // get root user id
    // let rootUser = await getRootUser(product.shopId, code);
    // let getUser = await DB.Event.findOne({ ownerId: rootUser._id });
    // let sponsorUser = null;

    // // special in file excel import
    // if (getUser.isForRoot) {
    //   sponsorUser = rootUser;
    //   getUser = await DB.Event.findOne({ level: 1 });
    //   rootUser = await getRootUser(product.shopId, null);
    // }

    const sponsorUser = await getRootUser(product.shopId, code);
    const getUser = await DB.Event.findOne({
      level: 1
    });
    const rootUser = await getRootUser(product.shopId, null);

    // get last user
    let lastUser = null;
    if (getUser.numberChild < MAX_CHILD) {
      lastUser = getUser;
    } else {
      lastUser = await DB.Event.findOne({
        sponsorId: rootUser._id,
        numberChild: {
          $lt: MAX_CHILD
        }
      }).sort({
        level: 1,
        createAt: 1
      });
      // const childArr = await DB.Event.find({ parentId: rootUser._id });
      // lastUser = await DB.Event.findOne({ parentId: rootUser._id, numberChild: { $lt: MAX_CHILD } }).sort({ level: 1, createAt: 1 });
      // if (!lastUser) {
      //   lastUser = await loopTree(childArr);
      // }
    }

    // get socialId of lastId
    let sponsorUserSocialId = 0;
    const {
      socialId
    } = await DB.UserSocial.findOne({
      userId: lastUser.ownerId
    }, {
      socialId: 1,
      _id: 0
    });
    if (sponsorUser) {
      const getId = await DB.Event.findOne({
        ownerName: sponsorUser.username
      });
      const getUserSocial = await DB.UserSocial.findOne({
        userId: getId.ownerId
      }, {
        socialId: 1,
        _id: 0
      });
      sponsorUserSocialId = parseInt(getUserSocial.socialId, 10);
    }
    let listUser = [];

    if (ROOT_LEVEL !== lastUser.level) {
      listUser = await loopEvent(lastUser.parentId);
    }
    listUser.push(parseInt(socialId, 10));

    let rsEvent = null;
    let event = null;
    const getNumberChild = await DB.Event.findOne({
      _id: lastUser._id
    }, {
      numberChild: 1
    });
    console.log('ownerName: ', ownerName, ', numberChild:', getNumberChild.numberChild);

    if (getNumberChild && getNumberChild.numberChild < MAX_CHILD) {
      event = new DB.Event({
        sponsorId: rootUser,
        sponsorName: rootUser.username,
        parentId: lastUser.ownerId,
        parentName: lastUser.ownerName,
        ownerId: userId,
        ownerName,
        productId: product._id,
        level: lastUser.level + 1,
        code: codeSpin,
        status: false
      });
      rsEvent = await event.save();
      await DB.Event.findByIdAndUpdate({
        _id: lastUser._id
      }, {
        $set: {
          numberChild: parseInt(getNumberChild.numberChild, 10) + 1
        }
      });
    }

    if (!rsEvent) {
      await DB.Event.findByIdAndDelete(event._id);

      await Service.Logger.createEvent({
        level: 'error',
        path: '/v1/event',
        error: 'Insert event not success',
        eventId: event._id,
        body: event,
        username: ownerName
      });
      return done();
    }
    /**
     * ---END---
     */

    /**
     * Create Order
     * ---START---
     */
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
      customerId: userId,
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

    const orderDetail = new DB.OrderDetail(Object.assign(customerInfo, {
      orderId: order._id,
      customerId: userId || null,
      shopId: product.shopId,
      productId: product._id,
      productVariantId: product.productVariantId,
      userNote: product.userNote,
      trackingCode: '',
      quantity,
      unitPrice,
      currency: SITE_CURRENCY,
      productDetails: product, // TODO - just pick go needed field
      userCurrency,
      currencyExchangeRate,
      shippingMethod: ''
    }));

    if (product.stockQuantity < orderDetail.quantity) {
      let msg =
        `Sản phẩm '${product.name}' số lượng chỉ còn ${product.stockQuantity}` +
        ',';

      if (product.stockQuantity === 0) {
        msg =
          `Sản phẩm '${product.name}' đã hết hàng` + ',';
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
    orderDetail.taxPrice = taxPrice * quantity;
    orderDetail.taxClass = product.taxClass;
    orderDetail.taxPercentage = product.taxPercentage;
    orderDetail.userTaxPrice =
      taxPrice * currencyExchangeRate * quantity;

    const productPrice = unitPrice * quantity;
    totalProducts += quantity;

    orderDetail.productPrice = productPrice;
    orderDetail.totalPrice =
      Math.round((productPrice + orderDetail.taxPrice) * 100) / 100; // TODO - round me

    totalPrice += orderDetail.totalPrice;
    orderDetail.userTotalPrice =
      orderDetail.totalPrice * currencyExchangeRate;

    order.totalProducts = totalProducts;
    order.totalPrice = totalPrice;
    order.userTotalPrice = totalPrice * currencyExchangeRate;
    /**
     * ---END---
     */

    const [rsOrder, rsOrderDetail] = await Promise.all([
      order.save(),
      orderDetail.save()
    ]);

    // Call payment goldtime
    const userToken = await Service.User.GetGoldtimeLatestAccessToken(userId);
    const paymentResponse = await Service.Wallet.buyFiveelementTicket(listUser, sponsorUserSocialId, userToken);

    // Rollback
    if (!rsOrder || !rsOrderDetail || !rsEvent || paymentResponse.StatusCode !== 200) {
      await Promise.all([
        DB.Order.findByIdAndDelete(order._id),
        DB.OrderDetail.findByIdAndDelete(orderDetail._id),
        DB.Event.findByIdAndDelete(event._id),
        DB.Event.findByIdAndUpdate({
          _id: lastUser._id
        }, {
          $set: {
            numberChild: getNumberChild.numberChild
          }
        })
      ]);

      if (paymentResponse.StatusCode !== 200) {
        await Service.Logger.createEvent({
          level: 'error-payment',
          path: '/v1/event',
          error: paymentResponse.Message,
          eventId: event._id,
          body: event,
          username: ownerName
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
            email, {
              subject: 'Mua vé ngũ hành tương sinh không thành công',
            }
          );
        }
      }

      return done();
    }

    // update quantity and numberChild
    await Promise.all([
      DB.Event.findByIdAndUpdate({
        _id: rsEvent._id
      }, {
        $set: {
          status: true
        }
      }),
      Service.Product.updateQuantity({
        productId: product._id,
        productVariantId: null,
        quantity
      })
    ]);

    this.sendEmailBuyTicketSuccess(product._id, codeSpin);

    await Service.Logger.createEvent({
      level: 'success',
      path: '/v1/event',
      error: 'Create event success',
      eventId: event._id,
      body: event,
      username: ownerName
    });

    return done();
  } catch (e) {
    await Service.Logger.createEvent({
      level: 'error-catch',
      path: '/v1/event',
      error: e
    });
    return done();
  }
});


exports.createEventRequest = async ({
  userId,
  ownerName,
  email,
  params,
  product
}) => {
  try {
    const {
      quantity,
      code
    } = params;
    const eventRequest = new DB.EventRequest({
      userId,
      ownerName,
      email,
      quantity,
      code,
      product,
    });
    await eventRequest.save();
    return true;
  } catch (e) {
    throw e;
  }
};

cron.schedule('* * * * *', async () => {
  if (SERVER_PRODUCTION === 'runJobProd') {
    const lstEvent = await DB.EventRequest.find({
      isProcess: false
    }).limit(LIMIT_REQUEST);

    for (const iterator of lstEvent) {
      try {
        const product = iterator.product;
        const code = iterator.code;
        const quantity = iterator.quantity;
        const ownerName = iterator.ownerName;
        const userId = iterator.userId;
        const email = iterator.email;
        const params = {
          code,
          quantity
        };
        /**
         * Get list user
         * ---STRAT---
         */
        // get root user id
        // let rootUser = await getRootUser(product.shopId, code);
        // let getUser = await DB.Event.findOne({ ownerId: rootUser._id });
        // let sponsorUser = null;

        // // special in file excel import
        // if (getUser.isForRoot) {
        //   sponsorUser = rootUser;
        //   getUser = await DB.Event.findOne({ level: 1 });
        //   rootUser = await getRootUser(product.shopId, null);
        // }

        const sponsorUser = await getRootUser(product.shopId, code);
        const getUser = await DB.Event.findOne({
          level: 1
        });
        const rootUser = await getRootUser(product.shopId, null);

        // get last user
        let lastUser = null;
        if (getUser.numberChild < MAX_CHILD) {
          lastUser = getUser;
        } else {
          lastUser = await DB.Event.findOne({
            sponsorId: rootUser._id,
            numberChild: {
              $lt: MAX_CHILD
            }
          }).sort({
            level: 1,
            createAt: 1
          });
          // const childArr = await DB.Event.find({ parentId: rootUser._id });
          // lastUser = await DB.Event.findOne({ parentId: rootUser._id, numberChild: { $lt: MAX_CHILD } }).sort({ level: 1, createAt: 1 });
          // if (!lastUser) {
          //   lastUser = await loopTree(childArr);
          // }
        }

        // get socialId of lastId
        let sponsorUserSocialId = 0;
        const {
          socialId
        } = await DB.UserSocial.findOne({
          userId: lastUser.ownerId
        }, {
          socialId: 1,
          _id: 0
        });
        if (sponsorUser) {
          const getId = await DB.Event.findOne({
            ownerName: sponsorUser.username
          });
          const getUserSocial = await DB.UserSocial.findOne({
            userId: getId.ownerId
          }, {
            socialId: 1,
            _id: 0
          });
          sponsorUserSocialId = parseInt(getUserSocial.socialId, 10);
        }
        let listUser = [];

        if (ROOT_LEVEL !== lastUser.level) {
          listUser = await loopEvent(lastUser.parentId);
        }
        listUser.push(parseInt(socialId, 10));

        let rsEvent = null;
        let event = null;
        const getNumberChild = await DB.Event.findOne({
          _id: lastUser._id
        }, {
          numberChild: 1
        });
        const codeSpin = await Service.SocialConnect.Invest.getCode();
        await Service.Logger.createEvent({
          level: 'codeSpin',
          path: '/v1/event',
          error: codeSpin.Message,
          body: event,
          username: ownerName
        });
        console.log('ownerName: ', ownerName, ', getNumberChild:', getNumberChild.numberChild);

        if (getNumberChild && getNumberChild.numberChild < MAX_CHILD) {
          event = new DB.Event({
            sponsorId: rootUser,
            sponsorName: rootUser.username,
            parentId: lastUser.ownerId,
            parentName: lastUser.ownerName,
            ownerId: userId,
            ownerName,
            productId: product._id,
            level: lastUser.level + 1,
            code: codeSpin,
            status: false
          });
          rsEvent = await event.save();
          await DB.Event.findByIdAndUpdate({
            _id: lastUser._id
          }, {
            $set: {
              numberChild: parseInt(getNumberChild.numberChild, 10) + 1
            }
          });
        }

        if (!rsEvent) {
          if (event) {
            await DB.Event.findByIdAndDelete(event._id);
          }

          await Service.Logger.createEvent({
            level: 'error',
            path: '/v1/event',
            error: 'Insert event not success',
            body: event,
            username: ownerName
          });
          return false;
        }
        /**
         * ---END---
         */

        /**
         * Create Order
         * ---START---
         */
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
          customerId: userId,
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

        const orderDetail = new DB.OrderDetail(Object.assign(customerInfo, {
          orderId: order._id,
          customerId: userId || null,
          shopId: product.shopId,
          productId: product._id,
          productVariantId: product.productVariantId,
          userNote: product.userNote,
          trackingCode: '',
          quantity,
          unitPrice,
          currency: SITE_CURRENCY,
          productDetails: product, // TODO - just pick go needed field
          userCurrency,
          currencyExchangeRate,
          shippingMethod: ''
        }));

        if (product.stockQuantity < orderDetail.quantity) {
          let msg =
            `Sản phẩm '${product.name}' số lượng chỉ còn ${product.stockQuantity}` +
            ',';

          if (product.stockQuantity === 0) {
            msg =
              `Sản phẩm '${product.name}' đã hết hàng` + ',';
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
        orderDetail.taxPrice = taxPrice * quantity;
        orderDetail.taxClass = product.taxClass;
        orderDetail.taxPercentage = product.taxPercentage;
        orderDetail.userTaxPrice =
          taxPrice * currencyExchangeRate * quantity;

        const productPrice = unitPrice * quantity;
        totalProducts += quantity;

        orderDetail.productPrice = productPrice;
        orderDetail.totalPrice =
          Math.round((productPrice + orderDetail.taxPrice) * 100) / 100; // TODO - round me

        totalPrice += orderDetail.totalPrice;
        orderDetail.userTotalPrice =
          orderDetail.totalPrice * currencyExchangeRate;

        order.totalProducts = totalProducts;
        order.totalPrice = totalPrice;
        order.userTotalPrice = totalPrice * currencyExchangeRate;
        /**
         * ---END---
         */

        const [rsOrder, rsOrderDetail] = await Promise.all([
          order.save(),
          orderDetail.save()
        ]);

        // Call payment goldtime
        const userToken = await Service.User.GetGoldtimeLatestAccessToken(userId);
        const paymentResponse = await Service.Wallet.buyFiveelementTicket(listUser, sponsorUserSocialId, userToken);

        // Rollback
        if (!rsOrder || !rsOrderDetail || !rsEvent || paymentResponse.StatusCode !== 200) {
          await Promise.all([
            DB.Order.findByIdAndDelete(order._id),
            DB.OrderDetail.findByIdAndDelete(orderDetail._id),
            DB.Event.findByIdAndDelete(event._id)
          ]);

          if (lastUser) {
            await DB.Event.findByIdAndUpdate({
              _id: lastUser._id
            }, {
              $set: {
                numberChild: getNumberChild.numberChild
              }
            });
          }
          await Service.Logger.createEvent({
            level: 'error-lastUser',
            path: '/v1/event',
            error: paymentResponse.Message,
            body: lastUser,
            username: ownerName
          });

          if (paymentResponse.StatusCode !== 200) {
            await Service.Logger.createEvent({
              level: 'error-payment',
              path: '/v1/event',
              error: paymentResponse.Message,
              eventId: event._id,
              body: event,
              username: ownerName
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
                email, {
                  subject: 'Mua vé ngũ hành tương sinh không thành công',
                }
              );
            }
          }

          return false;
        }

        // update quantity and numberChild
        await Promise.all([
          DB.Event.findByIdAndUpdate({
            _id: rsEvent._id
          }, {
            $set: {
              status: true
            }
          }),
          Service.Product.updateQuantity({
            productId: product._id,
            productVariantId: null,
            quantity
          })
        ]);

        this.sendEmailBuyTicketSuccess(product._id, codeSpin);

        await Service.Logger.createEvent({
          level: 'success',
          path: '/v1/event',
          error: 'Create event success',
          eventId: event._id,
          body: event,
          username: ownerName
        });
        await DB.EventRequest.findByIdAndUpdate({
          _id: iterator._id
        }, {
          $set: {
            isProcess: true
          }
        });
        // eventQ.createJob({
        //   action: 'buyTicketFiveElement', product, params, userId, ownerName, codeSpin, email
        // }).save();

        return true;
      } catch (e) {
        throw e;
      }
    }
  }
});

// exports.create = async ({
//   userId,
//   ownerName,
//   email,
//   params,
//   product
// }) => {

// };

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
    const node = await DB.Event.findOne({
      productId,
      code
    });

    if (!node) {
      throw new Error('Người dùng chưa mua vé sự kiện. Không thể tạo đường dẫn AFF.');
    }

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

    const node = await DB.Event.findOne({
      productId: data.productId,
      code: data.code
    });
    if (!node) {
      console.log('Không tìm thấy vé ngũ hành tương sinh');
      return done();
    }

    const ticket = await DB.Product.findOne({
      _id: data.productId
    });
    if (!ticket) {
      console.log('Không tìm thấy vé ngũ hành tương sinh');
      return done();
    }

    const user = await DB.User.findOne({
      username: node.ownerName
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

    const sendMailDev = await Service.Event.getRedisData('mail-develop');
    if (sendMailDev === 'true') {
      await Service.Mailer.send(
        'event/buy-five-element-ticket-success.html',
        'duynguyen2691989@gmail.com', {
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

exports.sendEmailBuyTicketSuccess = async (productId, code) => {
  try {
    return sendMail
      .createJob({
        action: 'sendEmailBuyTicketSuccess',
        productId,
        code
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
  const data = await readFileExcel(file.path);

  try {
    const msg = [];

    const checkTree = await DB.Event.count();
    if (checkTree > 1) {
      return {
        isImport: true
      };
    }

    for (const item of data) {
      let isError = false;

      const [isUser, isEvent] = await Promise.all([
        DB.User.findOne({
          username: item.username
        }),
        DB.Event.findOne({
          ownerName: item.username
        })
      ]);

      if (!isUser) {
        msg.push(`Username: ${item.username} chưa đăng nhập vào hệ thống`);
        isError = true;
      }

      if (isEvent) {
        msg.push(`Username: ${item.username} đã mua hàng, không thể tiếp tục`);
        isError = true;
      }

      if (!isError) {
        const rootUser = await DB.Event.findOne();
        let codeSpin = null;
        if (item.code) {
          codeSpin = item.code;
        } else {
          const getCode = await DB.Event.findOne({}, {
            code: 1,
            _id: 0
          }).sort({
            code: -1
          }).limit(1);
          codeSpin = (parseInt(getCode.code, 10) + 1).toString();
        }

        let lastUser = null;
        if (rootUser.numberChild < MAX_CHILD) {
          lastUser = rootUser;
        } else {
          lastUser = await DB.Event.findOne({
            sponsorId: rootUser.ownerId,
            numberChild: {
              $lt: MAX_CHILD
            }
          }).sort({
            level: 1,
            createAt: 1
          });
        }

        const obj = {
          sponsorId: rootUser.ownerId,
          sponsorName: rootUser.ownerName,
          parentId: lastUser.ownerId,
          parentName: lastUser.ownerName,
          ownerId: isUser._id,
          ownerName: isUser.username,
          productId: rootUser.productId,
          level: parseInt(lastUser.level, 10) + 1,
          code: codeSpin,
          isForRoot: true,
          status: true
        };

        await Promise.all([
          DB.Event.findByIdAndUpdate({
            _id: lastUser._id
          }, {
            $inc: {
              numberChild: 1
            }
          }),
          DB.Event.create(obj)
        ]);
      }
    }

    if (msg.length > 0) {
      await rollback();
      return {
        code: 400,
        msg
      };
    }

    for (const item of data) {
      const event = await DB.Event.findOne({
        ownerName: item.username
      });
      if (event) {
        await DB.Event.findOneAndUpdate({
          ownerName: item.username
        }, {
          $set: {
            status: false
          }
        });
        this.sendEmailBuyTicketSuccess(event.productId, event.code);
      }
    }

    return true;
  } catch (e) {
    await rollback();
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