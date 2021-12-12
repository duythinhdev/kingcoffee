/* eslint no-param-reassign: 0 */
const Joi = require('@hapi/joi');
const _ = require('lodash');
const path = require('path');
const moment = require('moment');

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(req.query.take, 10) || 10;

    const query = Helper.App.populateDbQuery(req.query, {
      equal: ['status', 'paymentStatus']
    });

    const filterUsername = Helper.App.populateDbQuery(req.query, {
      equal: ['username']
    }) || {};

    const productName = Helper.App.populateDbQuery(req.query, {
      equal: ['productName']
    }) || {};

    let user = null;
    if (filterUsername.username) {
      user = await DB.User.findOne({ username: filterUsername.username.trim() }, { _id: 1 });
    }

    const arrProduct = [];
    if (productName.productName) {
      const getProduct = await DB.Product.find({ name: new RegExp(productName.productName.trim(), 'i') }, { _id: 1 });
      if (getProduct) {
        getProduct.forEach(i => arrProduct.push(i._id));
      }
    }

    if (filterUsername.username) {
      query.customerId = user ? user._id : null;
    }

    if (arrProduct.length) {
      query.productId = { $in: arrProduct };
    }

    if (req.query.orderId) {
      query.orderId = { $in: req.query.orderId.trim() };
    }
    const sort = Helper.App.populateDBSort(req.query);

    if (req.query.startDate) {
      query.createdAt = { $gte: moment(req.query.startDate).toDate() };
    }
    if (req.query.toDate) {
      if (query.createdAt) {
        query.createdAt.$lte = moment(req.query.toDate).toDate();
      } else {
        query.createdAt = { $lte: moment(req.query.toDate).toDate() };
      }
    }

    // TODO - if admin, we dont need to query by customer
    query.shopId = req.user.shopId;
    const count = await DB.OrderDetail.countDocuments(query);
    const items = await DB.OrderDetail.find(query)
      .populate('customer')
      .collation({ locale: 'vi' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    // fetch and show main image if it does not include
    const productIds = [];
    items.forEach(item => productIds.push(item.productId));
    if (productIds.length) {
      const products = await DB.Product.find({ _id: { $in: productIds } }).select('_id mainImage');
      const mediaIds = products.map(p => p.mainImage);
      if (mediaIds) {
        const media = await DB.Media.find({ _id: { $in: mediaIds } });
        items.forEach((item) => {
          const product = _.find(products, p => p._id.toString() === item.productId.toString());
          if (product && product.mainImage) {
            const image = _.find(media, m => m._id.toString() === product.mainImage.toString());
            if (image) {
              if (!item.productDetails) {
                item.productDetails = {};
              }

              item.productDetails.mainImage = image.toJSON();
            }
          }
        });
      }
    }

    res.locals.list = {
      count,
      items: items.map((item) => {
        const data = item.toObject();
        if (item.customer) {
          data.customer = item.customer.toJSON();
        }
        data.details = item.details || [];
        return data;
      })
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.details = async (req, res, next) => {
  try {
    const details = await DB.OrderDetail.findOne({ _id: req.params.orderDetailId }).populate("promotions.promotionOrder").lean().exec();
    if (!details) {
      return next(PopulateResponse.notFound());
    }

    // load main image
    const product = await DB.Product.findOne({ _id: details.productId }).populate('mainImage');
    if (product && product.mainImage) {
      if (!details) {
        details = {};
      }

      details.mainImage = product.mainImage.toJSON();
    }
    res.locals.details = details;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      status: Joi.string().allow('pending', 'progressing', 'shipping', 'completed', 'refunded', 'cancelled').required()
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const subOrder = res.locals.details;
    const oldStatus = subOrder.status;
    await Service.Order.updateStatus(subOrder, validate.value.status);
    await Service.Order.addLog({
      eventType: 'updateStatus',
      changedBy: req.user._id,
      orderId: subOrder.orderId,
      orderDetailId: subOrder._id,
      oldData: {
        status: oldStatus
      },
      newData: {
        status: validate.value.status
      }
    });

    res.locals.update = {
      success: true,
      message: 'Cập Nhật Thành Công'
    };
    return next();
  } catch (e) {
    return next();
  }
};

exports.updateShippingInfo = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      shippingMethod: Joi.string().required(),
      shippingCode: Joi.string().required()
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const subOrder = res.locals.details;
    await DB.OrderDetail.update({ _id: subOrder._id }, {
      $set: validate.value
    });

    await Service.Order.addLog({
      eventType: 'updateShippingInfo',
      changedBy: req.user._id,
      orderId: subOrder.orderId,
      orderDetailId: subOrder._id,
      oldData: _.pick(subOrder, ['shippingMethod', 'shippingCode']),
      newData: validate.value
    });

    res.locals.update = {
      success: true
    };
    return next();
  } catch (e) {
    return next();
  }
};

exports.downloadDigitalFile = async (req, res, next) => {
  try {
    if (!req.query.token) {
      return next(PopulateResponse.error({
        message: 'Invalid token!'
      }));
    }
    const filePath = await Service.Order.getDigitalFileFromToken(req.query.token);
    if (Helper.String.isUrl(filePath)) {
      return res.redirect(filePath);
    }

    const fileFullPath = path.resolve(filePath);
    return res.download(fileFullPath);
  } catch (e) {
    return next(e);
  }
};

exports.getDownloadDigitalLink = async (req, res, next) => {
  try {
    await Service.Order.sendDigitalLink(res.locals.details._id);
    res.locals.link = {
      success: true,
      message: 'Một email với đường dẫn tải đã được gửi vào email của bạn'
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.downloadInvoice = async (req, res, next) => {
  try {
    const details = await DB.OrderDetail.findOne({ _id: req.params.orderDetailId });
    if (!details) {
      return next(PopulateResponse.notFound());
    }

    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) && details.customerId.toString() !== req.user._id.toString() &&
      (!req.user.shopId || req.user.shopId.toString() !== details.shopId.toString())) {
      return next(PopulateResponse.forbidden());
    }

    let forShop = true;
    if (details.customerId && req.user._id.toString() === details.customerId.toString()) {
      forShop = false;
    }
    const stream = await Service.Order.getPdfInvoiceStream(details, forShop);
    return stream.pipe(res);
  } catch (e) {
    return next(e);
  }
};
