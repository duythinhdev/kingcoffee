const moment = require('moment');
const _ = require('lodash');
const numeral = require('numeral');
const url = require('url');
const adminLog = require('../../adminlog');
const Queue = require('../../../kernel/services/queue');

const sendMail = Queue.create('send-mail-reward-nhts');
const sendMailOrder = Queue.create('send-mail-order-voucher');
const SITE_CURRENCY = process.env.SITE_CURRENCY || 'VND';

exports.create = async ({
  userId, username, code, admin, eventVoucherId
}) => {
  try {
    const orderNumber = await Service.Counters.getNextSequenceValue('event-winners-order-number');
    const res = await DB.EventWinners.create({
      userId,
      username,
      code,
      orderNumber,
      eventVoucherId
    });

    await Service.AdminLog.create(username, `${admin} đã quay thưởng, mã quay thưởng là ${code}`, adminLog.status.Added);

    return res;
  } catch (e) {
    throw e;
  }
};

exports.list = async (params) => {
  let { page, take } = params;
  page = Math.max(0, page - 1) || 0;
  take = parseInt(take, 10) || 0;

  try {
    let query = Helper.App.populateDbQuery(params, {
      equal: ['username', 'code']
    });

    const productQr = Helper.App.populateDbQuery(params, {
      equal: ['productName']
    });

    if (productQr && productQr.productName) {
      const arrProduct = await DB.Product.find({ $text: { $search: productQr.productName } }, { _id: 1 });
      if (arrProduct.length) {
        const productIds = [];
        arrProduct.forEach(i => productIds.push(i._id));

        const arrEventProduct = await DB.EventProduct.find({ productId: { $in: productIds } }, { eventVoucherId: 1 }).lean();
        if (arrEventProduct.length) {
          let eventVoucherIds = [];
          arrEventProduct.forEach(i => eventVoucherIds = [...eventVoucherIds, ...i.eventVoucherId]);

          query = {
            ...query,
            eventVoucherId: { $in: eventVoucherIds }
          };
        }
      }
    }

    const sort = Helper.App.populateDBSort(params);

    if (params.startDate) {
      query.createdAt = { $gte: moment(params.startDate).toDate() };
    }
    if (params.toDate) {
      if (query.createdAt) {
        query.createdAt.$lte = moment(params.toDate).toDate();
      } else {
        query.createdAt = { $lte: moment(params.toDate).toDate() };
      }
    }

    if (!Object.keys(query).length && Object.keys(productQr).length) {
      return { count: 0, items: [] };
    }

    const [items, count] = await Promise.all([
      DB.EventWinners.find(query)
        .populate({ path: 'user', select: 'phoneNumber email'})
        .populate({
          path: 'eventVoucher',
          populate: {
            path: 'eventProduct',
            select: 'productId',
            populate: {
              path: 'product',
              select: 'name',
            }
          }
        })
        .sort(sort)
        .skip(page * take)
        .limit(take)
        .lean(),
      DB.EventWinners.count(query)
    ]);
    
    // Foreach không await
    for(let i = 0; i < items.length; i++) {
      const winnerInfo = await DB.User.findOne({username: items[i].username}, {email: 1, phoneNumber: 1}); 
      items[i].winnerInfo = winnerInfo;
    }
    return { count, items };
  } catch (e) {
    throw e;
  }
};

// Service dành riêng cho các Seller có quyền quản lý EventWinner trong các EventProduct do họ tạo
exports.sellerList = async (params) => {
  let { page, take } = params;
  page = Math.max(0, page - 1) || 0;
  take = parseInt(take, 10) || 0;

  try {
    let query = Helper.App.populateDbQuery(params, {
      equal: ['username', 'code']
    });

    const seller = Helper.App.populateDbQuery(params, {
      equal: ['sellerId']
    })
    // Use to check if there are params for QR
    let rootSellerEventVoucherIds = [];
    if (seller && seller.sellerId) {
      const shop = await DB.Shop.findOne({ownerId: seller.sellerId}, {_id: 1});
      if (shop) {
        const arrSellerProduct = await DB.Product.find({shopId: shop.id})
        if (arrSellerProduct.length) {
          const sellerProductIds = [];
          arrSellerProduct.forEach(i => sellerProductIds.push(i._id));

          const arrSellerEventProduct = await DB.EventProduct.find({ productId: { $in: sellerProductIds } }, { eventVoucherId: 1 }).lean();
          if (arrSellerEventProduct.length) {
            arrSellerEventProduct.forEach(i => rootSellerEventVoucherIds = [...rootSellerEventVoucherIds, ...i.eventVoucherId]);
            query = {
              ...query,
              eventVoucherId: { $in: rootSellerEventVoucherIds }
            };
          } else {
            return { count: 0, items: [] };
          }
        } else {
          return { count: 0, items: [] };
        }
      } else {
        return { count: 0, items: [] };
      }
    } else {
      throw new Error('Cần cung cấp Seller Id')
    }

    const productQr = Helper.App.populateDbQuery(params, {
      equal: ['productName']
    });

    if (productQr && productQr.productName) {
      const arrProduct = await DB.Product.find({ $text: { $search: productQr.productName } }, { _id: 1 });
      if (arrProduct.length) {
        const productIds = [];
        arrProduct.forEach(i => productIds.push(i._id));

        const arrEventProduct = await DB.EventProduct.find({ productId: { $in: productIds } }, { eventVoucherId: 1 }).lean();
        if (arrEventProduct.length) {
          let eventVoucherIds = [];
          arrEventProduct.forEach(i => eventVoucherIds = [...eventVoucherIds, ...i.eventVoucherId]);

          const filterEventVoucherIds = _.intersectionWith(eventVoucherIds, rootSellerEventVoucherIds, _.isEqual);

          if (filterEventVoucherIds.length === 0) {
            return { count: 0, items: [] };
          }

          query = {
            ...query,
            eventVoucherId: { $in: filterEventVoucherIds }
          };
        } else {
          return { count: 0, items: [] };
        }
      } else {
        return { count: 0, items: [] };
      }
    }

    const sort = Helper.App.populateDBSort(params);

    if (params.startDate) {
      query.createdAt = { $gte: moment(params.startDate).toDate() };
    }
    if (params.toDate) {
      if (query.createdAt) {
        query.createdAt.$lte = moment(params.toDate).toDate();
      } else {
        query.createdAt = { $lte: moment(params.toDate).toDate() };
      }
    }

    if (!Object.keys(query).length && Object.keys(productQr).length) {
      return { count: 0, items: [] };
    }

    const [items, count] = await Promise.all([
      DB.EventWinners.find(query)
        .populate({ path: 'user', select: 'phoneNumber email'})
        .populate({
          path: 'eventVoucher',
          populate: {
            path: 'eventProduct',
            select: 'productId',
            populate: {
              path: 'product',
              select: 'name',
            }
          }
        })
        .sort(sort)
        .skip(page * take)
        .limit(take)
        .lean(),
      DB.EventWinners.count(query),
    ]);
    
    // Foreach không await
    for(let i = 0; i < items.length; i++) {
      const winnerInfo = await DB.User.findOne({username: items[i].username}, {email: 1, phoneNumber: 1}); 
      items[i].winnerInfo = winnerInfo;
    }
    return { count, items };
  } catch (e) {
    throw e;
  }
};

exports.detail = async ({ eventWinnerId }) => {
  try {
    const id = Helper.App.isMongoId(eventWinnerId) ? eventWinnerId : Helper.App.toObjectId(eventWinnerId);
    const result = await DB.EventWinners.findOne({ _id: id });

    return result;
  } catch (e) {
    throw e;
  }
};

exports.update = async ({ eventWinnerId, username, description }) => {
  try {
    const id = Helper.App.isMongoId(eventWinnerId) ? eventWinnerId : Helper.App.toObjectId(eventWinnerId);

    const exist = await DB.EventWinners.findByIdAndUpdate({ _id: id }, { $set: { description } });
    if (!exist) {
      throw new Error('Cập nhật không thành công');
    }

    await Service.AdminLog.create(exist.username, `${username} đã cập nhập nội dung giải thưởng, mã vé là ${exist.code}`, adminLog.status.Changed);

    return Object.assign(exist.toJSON(), { description });
  } catch (e) {
    throw e;
  }
};

exports.getVoucher = async (params) => {
  try {
    let data = null;
    let product = null;

    const [qrUsername, qrTicketCode, qrVoudcher] = await Promise.all([
      DB.EventWinners.findOne({ username: params.search })
        .populate({
          path: 'eventVoucher',
          populate: {
            path: 'eventProduct',
            select: 'productId'
          }
        }).lean(),
      DB.EventWinners.findOne({ code: params.search })
        .populate({
          path: 'eventVoucher',
          populate: {
            path: 'eventProduct',
            select: 'productId'
          }
        }).lean(),
      DB.EventVoucher.findOne({ code: params.search }).populate('eventProduct', 'productId').lean(),
    ]);

    if (params.type === 'voucher') { // check voucher off product detail web user
      const winner = await DB.EventWinners.findOne({ eventVoucherId: qrVoudcher._id, username: params.username })
        .populate({
          path: 'eventVoucher',
          populate: {
            path: 'eventProduct',
            select: 'productId expired createdAt isSale'
          }
        });

      if (!winner) {
        throw new Error('Mã voucher không hợp lệ');
      }

      const { eventVoucher: { eventProduct: { productId } } } = winner;
      if (!productId || (productId.toString() !== params.productId)) {
        throw new Error('Mã voucher không hợp lệ');
      }

      data = Object.assign(winner.toObject(), { eventVoucher: qrVoudcher });
      product = await DB.Product.findOne({ _id: qrVoudcher.eventProduct.productId });
      
      if(winner.eventVoucher.eventProduct.expired && winner.eventVoucher.eventProduct.isSale)
      {
        var d = new Date();
        var currentDate = moment(d).format('DD-MM-YYYY');
        var createProduct = moment(winner.eventVoucher.eventProduct.createdAt).add(winner.eventVoucher.eventProduct.expired, 'days').format('DD-MM-YYYY');
  
        if (!(currentDate < createProduct)) {
          throw new Error('Voucher đã hết hạn sử dụng!');
        } 
      }        
                  
    } 
    else if (!qrUsername && !qrTicketCode && !qrVoudcher) {
      const [ftUsername, ftTicketCode] = await Promise.all([
        Service.RequestNHTS.getList({ ownerName: params.search, pageNumber: 1, pageSize: 1 }),
        Service.RequestNHTS.getList({ ticketCode: params.search, pageNumber: 1, pageSize: 1 })
      ]);

      if (!ftUsername.length && !ftTicketCode.length) {
        throw new Error('Tài khoản hoặc mã vé không tồn tại');
      }

      return data;
    } 
    else if (qrUsername) {
      data = { ...qrUsername };
      const { eventVoucher: { eventProduct: { productId } } } = qrUsername;

      product = await DB.Product.findOne({ _id: productId });
    } 
    else if (qrTicketCode) {
      data = { ...qrTicketCode };
      const { eventVoucher: { eventProduct: { productId } } } = qrTicketCode;

      product = await DB.Product.findOne({ _id: productId });
    } 
    else {
      throw new Error('Tài khoản hoặc mã vé không tồn tại');
    }

    data.linkProduct = `${process.env.userWebUrl}products/${product.alias}`;
    const salePrice = `${numeral(product.salePrice).format('0,0')} đ`;
    data.description = `Một voucher mua ${product.name} do hệ thống Gold Time phát hành có giá trị ${salePrice}`;

    return data;
  } catch (e) {
    throw e;
  }
};

sendMail.process(async (job, done) => {
  try {
    const data = job.data;
    data.config = {};
    if (data.action !== 'sendEmailReward') return done();

    const getConfig = await DB.Config.find({ public: true, key: { $in: ['publicPhone', 'publicEmail'] } });
    getConfig.forEach((item) => {
      data.config[item.key] = item.value;
    });

    const salePrice = `${numeral(data.product.salePrice).format('0,0')} đ`;
    const cacheRedis = await Service.Event.getRedisData('cache-sendMail');
    if (cacheRedis === 'true') {
      await Service.Mailer.send(
        'event/send-mail-reward.html',
        data.email, {
        subject: 'Chúc mừng bạn đã trúng thưởng quay số NHTS',
        data: {
          username: data.username,
          product: data.product,
          salePrice,
          ticketCode: data.ticketCode,
          code: data.code,
          date: data.date,
          config: data.config,
          linkProduct: `${process.env.userWebUrl}products/${data.product.alias}`,
          reSearch: process.env.userWebUrl + process.env.LINK_RESEARCH
        }
      }
      );
    }

    return done();
  } catch (e) {
    await Service.Logger.create({
      level: 'error',
      path: 'event/send-mail-reward.html',
      error: e
    });

    return done();
  }
});

exports.sendEmailReward = (params) => {
  try {
    return sendMail
      .createJob(Object.assign(params, { action: 'sendEmailReward' }))
      .save();
  } catch (e) {
    throw e;
  }
};

exports.payment = async ({ data, user }) => {
  try {
    const userCurrency = SITE_CURRENCY;
    const currencyExchangeRate = 1;    

    const [product, eventProduct] = await Promise.all([
      DB.Product.findOne({ _id: data.productId })
        .populate('shop')
        .populate('mainImage'),
      DB.EventProduct.findOne({ status: true, productId: data.productId })
        //.populate('eventVoucher'),
        .populate({
          path: 'eventVoucher',
          match: { code: data.voucher }
        })
    ]);    

    if (!eventProduct) {
      throw new Error('Không tìm thấy sản phẩm trúng thưởng');
    }

    const getVoucher = eventProduct.eventVoucher || null;
    if (getVoucher[0] && getVoucher[0].expired) {
      throw new Error('Voucher đã được sử dụng, vui lòng nhập mã voucher khác');
    }

    const customerInfo = _.pick(data, [
      'phoneNumber',
      'name',
      'email',
      'zipCode',
      'streetAddress',
      'userIP',
      'userAgent'
    ]);

    const orderDetails = [];
    const order = new DB.Order(Object.assign(customerInfo, {
      customerId: user._id,
      currency: SITE_CURRENCY,
      trackingCode: [],
      userCurrency,
      currencyExchangeRate,
      paymentMethod: 'Ví GoldTime',
      paymentStatus: 'completed',
      firstName: data.name
    }));
    const totalProducts = data.quantity;
    let totalPrice = 0;
    const unitPrice = product.salePrice || product.price;

    const orderDetail = new DB.OrderDetail(Object.assign(customerInfo, {
      orderId: order._id,
      customerId: user._id || null,
      shopId: product.shop._id,
      productId: product._id,
      productVariantId: product.productVariantId,
      userNote: product.userNote,
      trackingCode: '',
      quantity: data.quantity,
      unitPrice,
      currency: SITE_CURRENCY,
      productDetails: product,
      userCurrency,
      currencyExchangeRate,
      shippingMethod: '',
      paymentStatus: 'completed',
      firstName: data.name
    }));

    let errorMessage = '';
    if (product.stockQuantity < orderDetail.quantity) {
      let msg =
        `Sản phẩm '${product.name}' số lượng chỉ còn ${product.stockQuantity}` +
        ',';

      if (product.product.stockQuantity === 0) {
        msg =
          `Sản phẩm '${product.name}' đã hết hàng,`;
      }

      errorMessage += msg;
    }

    if (errorMessage !== '') {
      throw new Error(errorMessage.substring(
        0,
        errorMessage.length - 1
      ));
    }

    const productPrice = unitPrice * data.quantity;
    orderDetail.productPrice = productPrice;
    orderDetail.totalPrice = 0;

    // totalPrice += orderDetail.totalPrice;
    orderDetail.userTotalPrice =
      orderDetail.totalPrice * currencyExchangeRate;

    orderDetails.push(orderDetail);

    order.totalProducts = totalProducts;
    order.totalPrice = totalPrice;
    order.userTotalPrice = totalPrice * currencyExchangeRate;

    const shippingInfo = _.pick(data, [
      'phoneNumber',
      'name',
      'email',
      'streetAddress',
      'shippingType',
      'description'
    ]);

    const [userSocial, ticketCode] = await Promise.all([
      Service.User.GetGoldtimeUserId(user._id),
      DB.EventWinners.findOne({ username: user.username }, { code: 1 })
    ]);

    if (!ticketCode) {
      throw new Error('Không tìm thấy mã vé');
    }
    const paymentResponse = await Service.Wallet.paymentEcommerceVoucher(
      {
        orderId: order._id,
        voucher: data.voucher,
        ticketCode: ticketCode.code,
        productId: product._id,
        productName: product.name,
        productPrice
      },
      userSocial.socialInfo.Token
    );

    if (paymentResponse.StatusCode !== 200) {
      throw new Error(paymentResponse.Message);
    }
    await Promise.all([
      order.save(),
      orderDetail.save(),
      DB.EventVoucher.findOneAndUpdate({ code: data.voucher }, { $set: { expired: true } }),
      DB.EventWinners.findOneAndUpdate({ username: user.username }, { $set: { shippingInfo } })
    ]);

    await Service.Product.updateQuantity({
      productId: product._id,
      productVariantId: null,
      quantity: data.quantity
    });
    
    this.sendEmailOrderVoucher({
      customer: shippingInfo, orderId: order._id, productName: product.name, quantity: data.quantity
    });    

    return order;
  } catch (e) {
    throw e;
  }
};

sendMailOrder.process(async (job, done) => {
  try {
    const data = job.data;
    if (data.action !== 'sendEmailOrder') return done();
    const orderLink = data.orderId ? url.resolve(process.env.userWebUrl, `orders/view/${data.orderId}`) : '';

    // const salePrice = `${numeral(data.product.salePrice).format('0,0')} đ`;
    const cacheRedis = await Service.Event.getRedisData('cache-sendMail');
    if (cacheRedis === 'true') {
      await Service.Mailer.send(
        'event/order-voucher.html',
        data.customer.email, {
        subject: `Đơn hàng mới #${data.orderId}`,
        data: {
          customer: data.customer,
          orderId: data.orderId,
          productName: data.productName,
          quantity: data.quantity,
          orderLink,
          userTotalPriceStr: 0
        }
      }
      );
    }

    return done();
  } catch (e) {
    await Service.Logger.create({
      level: 'error',
      path: 'event/order-voucher.html',
      error: e
    });

    return done();
  }
});

exports.sendEmailOrderVoucher = (params) => {
  try {
    return sendMailOrder
      .createJob(Object.assign(params, { action: 'sendEmailOrder' }))
      .save();
  } catch (e) {
    throw e;
  }
};
