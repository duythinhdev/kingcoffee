/* eslint no-param-reassign: 0, no-await-in-loop: 0, no-restricted-syntax: 0, no-continue: 0 */
const Joi = require("@hapi/joi");
const moment = require("moment");

const validateSchema = Joi.object().keys({
  products: Joi.array()
    .items(
      Joi.object().keys({
        productId: Joi.string()
          .required()
          .messages({
            "string.base": '"productId" bắt buộc phải là những ký tự',
            "string.empty": '"productId" không được để trống',
            "any.required": 'Yêu cầu phải có "productId"'
          }),
        quantity: Joi.number()
          .required()
          .min(0)
          .messages({
            "number.base": '"quantity" bắt buộc phải là 1 số',
            "number.empty": '"quantity" không được để trống'
          }),
        // shippingMethod: Joi.string().allow(null, '').optional(),
        userNote: Joi.string()
          .allow(null, "")
          .optional()
          .messages({
            "string.base": '"userNote" bắt buộc phải là những ký tự'
          }),
        productVariantId: Joi.string()
          .allow(null, "")
          .optional()
          .messages({
            "string.base": '"productVariantId" bắt buộc phải là những ký tự'
          }),
        couponCode: Joi.string()
          .allow("", null)
          .optional()
          .messages({
            "string.base": '"couponCode" bắt buộc phải là những ký tự'
          }),
        promotions: Joi.array()
          .allow("", null)
          .optional()
          .messages({
            "array.base": '"promotions" bắt buộc phải là mảng'
          })
      })
    )
    .required()
    .messages({
      "array.base": '"products" bắt buộc phải là 1 mảng',
      "array.empty": '"products" không được để trống',
      "any.required": 'Yêu cầu phải có "products"'
    }),
  // TODO - update me
  transportation: Joi.object()
    .keys({
      id: Joi.number()
        .required()
        .min(0)
        .messages({
          "number.base": '"transportation id" bắt buộc phải là số',
          "number.empty": '"transportation id" không được để trống'
        }),
      name: Joi.string()
        .required()
        .min(0)
        .messages({
          "number.base": '"transportation name" bắt buộc phải là ký tự',
          "number.empty": '"transportation name" không được để trống'
        })
    })
    .allow("", null)
    .optional()
    .messages({
      "string.base": '"transportation" bắt buộc phải là object'
    }),
  shippingAddress: Joi.string()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": '"shippingAddress" bắt buộc phải là những ký tự'
    }),
  shippingPrice: Joi.number()
    .optional()
    .required()
    .messages({
      "string.base": '"shippingPrice" bắt buộc phải là số',
      "string.empty": '"shippingPrice" không được để trống'
    }),
  percentDiscount: Joi.number()
    .optional()
    .required()
    .messages({
      "string.base": '"percentDiscount" bắt buộc phải là số',
      "string.empty": '"percentDiscount" không được để trống'
    }),
  paymentMethod: Joi.string()
    .optional()
    .allow(null)
    .messages({
      "string.base": '"paymentMethod" bắt buộc phải là những ký tự',
      "string.empty": '"paymentMethod" không được để trống'
    }),
  phoneNumber: Joi.string()
    .required()
    .messages({
      "string.base": '"phoneNumber" bắt buộc phải là những ký tự',
      "string.empty": '"phoneNumber" không được để trống',
      "any.required": 'Yêu cầu phải có "phoneNumber"'
    }),
  firstName: Joi.string()
    .required()
    .messages({
      "string.base": '"firstName" bắt buộc phải là những ký tự',
      "string.empty": '"firstName" không được để trống',
      "any.required": 'Yêu cầu phải có "firstName"'
    }),
  lastName: Joi.string()
    .required()
    .messages({
      "string.base": '"lastName" bắt buộc phải là những ký tự',
      "string.empty": '"lastName" không được để trống',
      "any.required": 'Yêu cầu phải có "lastName"'
    }),
  streetAddress: Joi.string()
    .required()
    .messages({
      "string.base": '"streetAddress" bắt buộc phải là những ký tự',
      "string.empty": '"streetAddress" không được để trống',
      "any.required": 'Yêu cầu phải có "streetAddress"'
    }),
  city: Joi.object().keys({
    id: Joi.number()
      .required()
      .messages({
        "string.base": `"city{id}" bắt buộc phải là số`,
        "string.empty": `"city{id}" không được để trống`,
        "any.required": `Yêu cầu phải có "city{id}"`
      }),
    name: Joi.string()
      .required()
      .messages({
        "string.base": `"city{name}" bắt buộc phải là những ký tự`,
        "string.empty": `"city{name}" không được để trống`,
        "any.required": `Yêu cầu phải có "city{name}"`
      })
  }),
  ward: Joi.object().keys({
    id: Joi.number()
      .required()
      .messages({
        "string.base": `"ward{id}" bắt buộc phải là số`,
        "string.empty": `"ward{id}" không được để trống`,
        "any.required": `Yêu cầu phải có "ward{id}"`
      }),
    name: Joi.string()
      .required()
      .messages({
        "string.base": `"ward{name}" bắt buộc phải là những ký tự`,
        "string.empty": `"ward{name}" không được để trống`,
        "any.required": `Yêu cầu phải có "ward{name}"`
      })
  }),
  district: Joi.object().keys({
    id: Joi.number()
      .required()
      .messages({
        "string.base": `"district{id}" bắt buộc phải là số`,
        "string.empty": `"district{id}" không được để trống`,
        "any.required": `Yêu cầu phải có "district{id}"`
      }),
    name: Joi.string()
      .required()
      .messages({
        "string.base": `"district{name}" bắt buộc phải là những ký tự`,
        "string.empty": `"district{name}" không được để trống`,
        "any.required": `Yêu cầu phải có "district{name}"`
      })
  }),
  zipCode: Joi.number()
    .allow(null, '')
    .messages({
      "string.base": '"zipCode" bắt buộc phải là những ký tự',
      "string.empty": '"zipCode" không được để trống',
      "any.required": 'Yêu cầu phải có "zipCode"'
    }),
  userCurrency: Joi.string()
    .optional()
    .messages({
      "string.base": '"userCurrency" bắt buộc phải là những ký tự',
      "string.empty": '"userCurrency" không được để trống'
    }),
  toHubId: Joi.number()
    .allow(null)
    .optional()
    .messages({
      "string.base": '"toHubId" bắt buộc phải là số'
    }),
  shipmentTypeId: Joi.number()
    .optional()
    .messages({
      "string.base": '"shipmentTypeId" bắt buộc phải là số'
    }),
  returnUrl: Joi.string()
    .allow("", null)
    .optional()
    .messages({
      "string.base": '"returnUrl" bắt buộc phải là những ký tự'
    }),
  expectedDeliveryDate: Joi.string().allow("", null),
  freeShipCode: Joi.string()
  .allow("", null)
  .optional()
  .messages({
    "string.base": '"promotions" bắt buộc phải là ký tự'
  }),
  promotions: Joi.array()
    .allow("", null)
    .optional()
    .messages({
      "array.base": '"promotions" bắt buộc phải là mảng'
  }),
  // phoneVerifyCode: Joi.string().allow(null, '').when('paymentMethod', {
  //   is: 'cod',
  //   then: Joi.required(),
  //   otherwise: Joi.optional()
  // })
  bu: Joi.string()
    .allow("", null)
    .optional()
    .messages({
      "string.base": '"bu" bắt buộc phải là ký tự'
  }),
  couponCode: Joi.array()
    .allow("", null)
    .optional()
    .messages({
      "array.base": '"couponCode" bắt buộc phải là mảng'
  })
});

/**
 * Create a new order
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    // verify code
    // if (validate.value.paymentMethod === 'cod') {
    //   await Service.Order.verifyPhoneCheck({
    //     phoneNumber: validate.value.phoneNumber,
    //     userId: req.user ? req.user._id : null,
    //     code: validate.value.phoneVerifyCode
    //   });
    // }

    // assign user agent and IP address here
    const userIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");
    const data = Object.assign({
        userIP,
        userAgent
      },
      validate.value
    );
    const order = Service.Order.create(data, req.user || {});
    // hide cod number on response
    order.codVerifyCode = "";
    res.locals.order = order;
    return next(PopulateResponse.success(order, "Thanh toán thành công"));
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new order v2
 */
exports.createQROrderV2 = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    // assign user agent and IP address here
    const userIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const flatform = req.headers.platform;
    const userAgent = req.get("User-Agent");
    const data = Object.assign({
        userIP,
        userAgent,
        flatform
      },
      validate.value
    );
    let message = "Tạo đơn hàng thành công";

    const order = await Service.OrderV2.createFromOrder(data, req.user || {});
    if (order.order.message != "") {
      message = order.order.message;
    }
    // hide cod number on response
    order.codVerifyCode = "";
    res.locals.order = order;
    return next(PopulateResponse.success(order, message));
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new order v2
 */
 exports.createOrderV2 = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    // assign user agent and IP address here
    const userIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const flatform = req.headers.platform;
    const userAgent = req.get("User-Agent");
    const data = Object.assign({
        userIP,
        userAgent,
        flatform
      },
      validate.value
    );
    let message = "Tạo đơn hàng thành công";

    const order = await Service.OrderV2.create(data, req.user || {});
    if (order.order.message != "") {
      message = order.order.message;
    }
    // hide cod number on response
    order.codVerifyCode = "";
    res.locals.order = order;
    return next(PopulateResponse.success(order, message));
  } catch (e) {
    return next(e);
  }
};

exports.qrOrdersTotalAmount = async (req, res, next) => {
  try {
    const query = Helper.App.populateDbQuery(req.query, {
      equal: ["orderCode", "createdAt", "expectedDeliveryDate"],
      text: ["_id"]
    });

    query.orderStatus = 'scanned';

    if (query.createdAt) {
      //query.createdAt = new Date(query.createdAt).toISOString();
      query.createdAt = {
        $gte: moment(query.createdAt).toDate(),
        $lte: moment(query.createdAt).add(1, 'days').toDate()
      };
      //query.createdAt = ISODate(moment(query.createdAt).toDate());
    }

    const filterMemberId =
      Helper.App.populateDbQuery(req.query, {
        equal: ["memberId"]
      }) || {};

    const transactionId = await DB.Transaction.find({
      status: req.query.paymentStatus
    }).select("_id");

    if (transactionId.length > 0) {
      query.transactionId = transactionId;
    }

    if (
      req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      ) &&
      filterMemberId.memberId
    ) {
      const user = await DB.User.findOne({
        memberId: filterMemberId.memberId
      }, {
        _id: 1
      });
      if (user) {
        query.customerId = user._id;
      } else {
        query.customerId = null;
      }
    } else if (
      !req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      )
    ) {
      query.customerId = req.user._id;
    }

    const count = await DB.Order.countDocuments(query);
    const totalAmount = await DB.Order.aggregate([
      { $match: {
        customerId: query.customerId,
        orderStatus: query.orderStatus
      }},
      { $group: {
          _id: null,
          customerId:  { $first: query.customerId },
          orderStatus: { $first: query.orderStatus },
          total:       { $sum: { $add: "$totalPrice" } },
      }}
    ])

    res.locals.list = {
      count,
      totalAmount
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(req.query.take, 10) || 10;

    const query = Helper.App.populateDbQuery(req.query, {
      equal: ["orderCode", "createdAt", "expectedDeliveryDate"],
      text: ["_id"]
    });

    if(req.query.orderStatus){
      query.orderStatus = req.query.orderStatus;
    }

    if (query.createdAt) {
      //query.createdAt = new Date(query.createdAt).toISOString();
      query.createdAt = {
        $gte: moment(query.createdAt).toDate(),
        $lte: moment(query.createdAt).add(1, 'days').toDate()
      };
      //query.createdAt = ISODate(moment(query.createdAt).toDate());
    }

    const filterMemberId =
      Helper.App.populateDbQuery(req.query, {
        equal: ["memberId"]
      }) || {};

    const transactionId = await DB.Transaction.find({
      status: req.query.paymentStatus
    }).select("_id");

    if (transactionId.length > 0) {
      query.transactionId = transactionId;
    }

    const sort = Helper.App.populateDBSort(req.query);

    if (
      req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      ) &&
      filterMemberId.memberId
    ) {
      const user = await DB.User.findOne({
        memberId: filterMemberId.memberId
      }, {
        _id: 1
      });
      if (user) {
        query.customerId = user._id;
      } else {
        query.customerId = null;
      }
    } else if (
      !req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      )
    ) {
      query.customerId = req.user._id;
    }

    const count = await DB.Order.countDocuments(query);
    const items = await DB.Order.find(query)
      .populate({
        path: "details",
        populate: [{
            path: "product",
            populate: {
              path: "mainImage"
            }
          },
          {
            path: "promotions.promotionOrder"
          }
        ]
      })
      .populate("customer")
      .populate("transaction")
      .populate("promotions.promotionOrder")
      .collation({
        locale: "vi"
      })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .lean()
      .exec();

    for (const itemOrder of items) {
      for (const itemOrderDetail of itemOrder.details) {
        if (itemOrderDetail.promotions && itemOrderDetail.promotions.length > 0) {
          for (const iterator of itemOrderDetail.promotions) {
            if (iterator.promotionOrder) {
              let promo = await DB.Promotion.findById(iterator.promotion);
              iterator.promotionOrder = promo;
            } else {
              iterator.promotionOrder = null;
              let promo = await DB.Promotion.findById(iterator.promotion);
              iterator.promotionOrder = promo;
            }
          }
        }
      }
    }

    res.locals.list = {
      count,
      items
    };
    // res.locals.list = {
    //   count,
    //   items: items.map(item => {
    //     const data = item.toObject();
    //     if (item.customer) {
    //       data.customer = item.customer.toJSON();
    //     }
    //     data.details = item.details || [];
    //     data.codVerifyCode = "";
    //     return data;
    //   })
    // };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getAllList = async (req, res, next) => {
  try {
    const query = Helper.App.populateDbQuery(req.query, {
      equal: ["orderCode", "expectedDeliveryDate", "docNo"],
      text: ["_id"]
    });

    if (req.query.startDate) {
      query.createdAt = {
        $gte: moment(req.query.startDate, 'DD-MM-YYYY').toDate(),
      };
    }

    if (req.query.endDate) {
      query.createdAt = {
        $lte: moment(req.query.endDate, 'DD-MM-YYYY').add(1, 'days').toDate()
      };
    }

    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: moment(req.query.startDate, 'DD-MM-YYYY').toDate(),
        $lte: moment(req.query.endDate, 'DD-MM-YYYY').add(1, 'days').toDate()
      };
    }

    if(req.query.orderStatus){
      query.orderStatus = req.query.orderStatus;
    }

    const filterMemberId =
      Helper.App.populateDbQuery(req.query, {
        equal: ["memberId"]
      }) || {};

    const transactionId = await DB.Transaction.find({
      status: req.query.paymentStatus
    }).select("_id");

    if (transactionId.length > 0) {
      query.transactionId = transactionId;
    }

    if(req.query.sortDocNo != 'null'){
      if(req.query.sortDocNo === 'true'){
        query.docNo = { $ne: null }
      }else{
        query.docNo = { $eq: null }
      }
    }else{
      delete query.sortDocNo;
    }

    const sort = Helper.App.populateDBSort(req.query);

    if (
      req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      ) &&
      filterMemberId.memberId
    ) {
      const user = await DB.User.findOne({
        memberId: filterMemberId.memberId
      }, {
        _id: 1
      });
      if (user) {
        query.customerId = user._id;
      } else {
        query.customerId = null;
      }
    } else if (
      !req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      )
    ) {
      query.customerId = req.user._id;
    }
    
    const count = await DB.Order.countDocuments(query);
    const items = await DB.Order.find(query)
      .populate({
        path: "details",
        populate: [{
          path: "product",
          populate: [{
            path: "mainImage"
          }, {
            path: "category",
            populate: {
              path: "parentCategory"
            }
          }]
        }, {
          path: "promotions.promotionOrder"
        }]
      })
      .populate("customer")
      .populate("transaction")
      .populate("promotions.promotionOrder")
      .collation({
        locale: "vi"
      })
      .sort(sort)
      .lean()
      .exec();

    for (const itemOrder of items) {
      for (const itemOrderDetail of itemOrder.details) {
        if (itemOrderDetail.promotions && itemOrderDetail.promotions.length > 0) {
          for (const iterator of itemOrderDetail.promotions) {
            if (iterator.promotionOrder) {
              let promo = await DB.Promotion.findById(iterator.promotion);
              iterator.promotionOrder = promo;
            } else {
              iterator.promotionOrder = null;
              let promo = await DB.Promotion.findById(iterator.promotion);
              iterator.promotionOrder = promo;
            }
          }
        }
      }
    }

    res.locals.list = {
      count,
      items
    };

    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getAllListScanned = async (req, res, next) => {
  try {
    const query = Helper.App.populateDbQuery(req.query, {
      equal: ["orderCode", "expectedDeliveryDate", "docNo"],
      text: ["_id"]
    });

    if (req.query.startDate) {
      query.createdAt = {
        $gte: moment(req.query.startDate, 'DD-MM-YYYY').toDate(),
      };
    }

    if (req.query.endDate) {
      query.createdAt = {
        $lte: moment(req.query.endDate, 'DD-MM-YYYY').add(1, 'days').toDate()
      };
    }

    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: moment(req.query.startDate, 'DD-MM-YYYY').toDate(),
        $lte: moment(req.query.endDate, 'DD-MM-YYYY').add(1, 'days').toDate()
      };
    }

    if (req.query.startPrice) {
      query.totalPrice = {
        $gte: req.query.startPrice,
      };
    }

    if (req.query.endPrice) {
      query.totalPrice = {
        $lte: req.query.endPrice,
      };
    }

    if (req.query.startPrice && req.query.endPrice) {
      query.totalPrice = {
        $gte: req.query.startPrice,
        $lte: req.query.endPrice,
      };
    }



    if(req.query.orderStatus){
      query.orderStatus = req.query.orderStatus;
    }

    if(req.query.phoneNumber){
      query.phoneNumber = req.query.phoneNumber;
    }

    if(req.query.username){
      query.firstName = req.query.username;
    }

    if(req.query.bu){
      query.bu = req.query.bu;
    }

    if(req.query.cityId) {
      query["city.id"] = parseInt(req.query.cityId);
    }
    const filterMemberId =
      Helper.App.populateDbQuery(req.query, {
        equal: ["memberId"]
      }) || {};

    const transactionId = await DB.Transaction.find({
      status: req.query.paymentStatus
    }).select("_id");

    if (transactionId.length > 0) {
      query.transactionId = transactionId;
    }

    if(req.query.sortDocNo != 'null'){
      if(req.query.sortDocNo === 'true'){
        query.docNo = { $ne: null }
      }else{
        query.docNo = { $eq: null }
      }
    }else{
      delete query.sortDocNo;
    }

    const sort = Helper.App.populateDBSort(req.query);

    if (
      req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      ) &&
      filterMemberId.memberId
    ) {
      const user = await DB.User.findOne({
        memberId: filterMemberId.memberId
      }, {
        _id: 1
      });
      if (user) {
        query.customerId = user._id;
      } else {
        query.customerId = null;
      }
    } else if (
      !req.user.userRoles.find(
        x => x.Role === Enums.UserEnums.UserRole.Admin.value
      )
    ) {
      query.customerId = req.user._id;
    }
    
    let count = await DB.Order.countDocuments(query);
    let items = await DB.Order.find(query)
      .populate({
        path: "details",
        populate: [{
          path: "product",
          populate: [{
            path: "mainImage"
          }, {
            path: "category",
            populate: {
              path: "parentCategory"
            }
          }]
        }, {
          path: "promotions.promotionOrder"
        }]
      })
      .populate("customer")
      .populate("transaction")
      .populate("promotions.promotionOrder")
      .collation({
        locale: "vi"
      })
      .sort(sort)
      .lean()
      .exec();

    for (const itemOrder of items) {
      for (const itemOrderDetail of itemOrder.details) {
        if (itemOrderDetail.promotions && itemOrderDetail.promotions.length > 0) {
          for (const iterator of itemOrderDetail.promotions) {
            if (iterator.promotionOrder) {
              let promo = await DB.Promotion.findById(iterator.promotion);
              iterator.promotionOrder = promo;
            } else {
              iterator.promotionOrder = null;
              let promo = await DB.Promotion.findById(iterator.promotion);
              iterator.promotionOrder = promo;
            }
          }
        }
      }
    }
    let arr = [];
    if(req.query.we_id){
      items.forEach(element => {
        if(req.query.we_id == 2){
          if(element.customer.userRoles.length == 2){
            arr.push(element)
          }
        }
        else if(req.query.we_id == 1){
          if(element.customer.userRoles.length == 1 && element.customer.userRoles[0].Role == req.query.we_id){
            arr.push(element)
          }
        }
        else{
          if(element.customer.userRoles[0].Role == req.query.we_id){
            arr.push(element)
          }
        }

           
      });
    }

    if(req.query.we_id){
      items = arr;
      count = arr.length;
    }
    if(req.query.sap){
      items.forEach(element => {
          if(element.details[0].product.sap == req.query.sap){
            arr.push(element)
          }
      });
    }

    if(req.query.sap){
      items = arr;
      count = arr.length;
    }
    items = removeDuplicates(items, '_id');
    count = items.length;
    res.locals.list = {
      count,
      items
    };

    return next();
  } catch (e) {
    return next(e);
  }
};

exports.details = async (req, res, next) => {
  try {
    // TODO - check admin role here
    // or if it is shop, we only sub order of shop here
    const query = {
      _id: req.params.orderId
    };

    const item = await DB.Order.findOne(query)
      .populate("customer")
      .populate({
        path: "details",
        populate: [{
            path: "product",
            populate: {
              path: "mainImage"
            }
          },
          {
            path: "promotions.promotionOrder"
          }
        ]
      })
      .populate("transaction")
      .populate("promotions.promotionOrder")
      .lean()
      .exec();

    if (!item) {
      return next(PopulateResponse.notFound());
    }

    const data = item;
    if (data.customerId) {
      const customer = await DB.User.findOne({
        _id: data.customerId
      });
      if (customer) {
        data.customer = customer.toJSON();
      }
    }

    res.locals.order = data;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new order v2
 */
exports.checkPayment = async (req, res, next) => {
  try {
    const order = await Service.OrderV2.checkPayment(
      req.params.orderId,
      req.body,
      req.user || {}
    );
    res.locals.checkPayment = order;
    return next(
      PopulateResponse.success(order, "Đơn hàng đã được thanh toán thành công")
    );
  } catch (e) {
    return next(e);
  }
};

exports.paymentGoldtime = async (req, res, next) => {
  try {
    const order = await Service.OrderV2.paymentGoldtime(
      req.params.orderId,
      req.body.token,
      req.user || {}
    );
    res.locals.paymentGoldtime = order;
    return next(PopulateResponse.success(order, "Thanh toán thành công"));
  } catch (e) {
    return next(e);
  }
};

exports.paymentStatus = async (req, res, next) => {
  try {
    const subValidateSchema = Joi.object().keys({
      paymentStatus: Joi.string()
        .required()
        .messages({
          "string.base": '"paymentStatus" bắt buộc phải là những ký tự',
          "string.empty": '"paymentStatus" không được để trống'
        })
    });

    const validate = subValidateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const order = await Service.OrderV2.paymentStatus(
      req.params.orderId,
      req.body.paymentStatus
    );
    res.locals.paymentStatus = order;
    return next(
      PopulateResponse.success(order, "Cập nhật trạng thái đơn hàng thành công")
    );
  } catch (e) {
    return next(e);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const subValidateSchema = Joi.object().keys({
      orderId: Joi.string().required(),
      reasonCancel: Joi.string()
        .required()
        .messages({
          "string.base": '"reasonCancel" bắt buộc phải là những ký tự',
          "string.empty": '"reasonCancel" không được để trống'
        })
    });

    const validate = subValidateSchema.validate({
      orderId: req.params.orderId,
      reasonCancel: req.body.reasonCancel
    });

    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    await Service.OrderV2.cancelOrder(
      req.params.orderId,
      req.user._id,
      req.body.reasonCancel
    );

    return next(
      PopulateResponse.success(req.params.orderId, "Huỷ đơn hàng thành công")
    );
  } catch (e) {
    return next(e);
  }
};

exports.reassignHub = async (req, res, next) => {
  try {
    const subValidateSchema = Joi.object().keys({
      orderId: Joi.string().required(),
      toHubId: Joi.number()
        .required()
        .messages({
          "string.base": `"district{id}" bắt buộc phải là số`,
          "string.empty": `"district{id}" không được để trống`,
        })
    });

    const validate = subValidateSchema.validate({
      orderId: req.params.orderId,
      toHubId: req.body.toHubId
    });

    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const reassignHub = await Service.OrderV2.reassignHub(
      req.params.orderId,
      req.body.toHubId
    );

    res.locals.reassignHub = reassignHub;
    return next(PopulateResponse.success(reassignHub));
  } catch (e) {
    return next(e);
  }
};

exports.confirmOrderHub = async (req, res, next) => {
  try {
    const subValidateSchema = Joi.object().keys({
      orderId: Joi.string().required()
    });

    const validate = subValidateSchema.validate({
      orderId: req.params.orderId
    });

    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const confirmOrderHub = await Service.OrderV2.confirmOrderHub(
      req.params.orderId,
      req.user._id,
    );

    res.locals.confirmOrderHub = confirmOrderHub;
    return next(PopulateResponse.success(confirmOrderHub));
  } catch (e) {
    return next(e);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const subValidateSchema = Joi.object().keys({
      orderId: Joi.string().required(),
      orderDetails: Joi.array().items({
        id: Joi.string()
          .required()
          .messages({
            "string.base": '"orderDetailId" bắt buộc phải là những ký tự',
            "string.empty": '"orderDetailId" không được để trống',
            "any.required": 'Yêu cầu phải có "orderDetailId"'
          }),
        quantity: Joi.number()
          .required()
          .messages({
            "string.base": `"quantity" bắt buộc phải là số`,
            "string.empty": `"quantity" không được để trống`,
            "any.required": `Yêu cầu phải có "quantity"`
          })
      }),
    });

    const validate = subValidateSchema.validate({
      orderId: req.params.orderId,
      orderDetails: req.body.orderDetails
    });

    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    let message = "Cập nhật trạng thái đơn hàng thành công";
    const updateOrder = await Service.OrderV2.updateOrder(
      req.params.orderId,
      req.body,
      req.user
    );

    res.locals.updateOrder = updateOrder;
    return next(PopulateResponse.success(updateOrder, message));
  } catch (e) {
    return next(e);
  }
};

// test order code service
// exports.createOrderCode = async (req, res, next) => {
//   try {
//     const orderCode = await Service.OrderCode.getCode(req.params.role);
//     res.locals.orderCode = orderCode;
//     return next();
//   } catch (error) {
//     next(e);
//   }
// }

//Thống kê data cho Invest tổng order thành công theo khoảng thời gian
exports.totalPriceCheckoutByDate = async (req, res, next) => {
  try {
    const validateSchemaModel = Joi.object().keys({
      startDate: Joi.string().required().messages({
        "date.empty": `"startDate" không được để trống`,
      }),
      endDate: Joi.string().required().messages({
        "date.empty": `"endDate" không được để trống`,
      }),
    });

    const validateRequest = validateSchemaModel.validate(req.query);

    const list = await Service.Transaction.totalPriceCheckoutByDate(validateRequest.value);
    res.locals.list = list;
    return next(PopulateResponse.success(list, "Thống kê dữ liệu thành công"));
  } catch (e) {
    return next(e);
  }
};

exports.assignHub = async (req, res, next) => {
  try {
    const validateSchemaModel = Joi.object().keys({
      orderId: Joi.string().required().messages({
        "string.empty": `"orderId" không được để trống`,
      }),
      fromHubId: Joi.string().required().messages({
        "string.empty": `"fromHubId" không được để trống`,
      }),
    });

    const validateRequest = validateSchemaModel.validate({
      orderId: req.params.orderId,
      fromHubId: req.body.fromHubId
    });

    if (validateRequest.error) {
      return next(PopulateResponse.validationError(validateRequest.error));
    }

    let order = await DB.Order.findOne({_id: validateRequest.value.orderId, isAssignHub: false});
    if(order){
      const createShipmentRes = await Service.Delivery.createShipment(order, validateRequest.value.fromHubId);

      if (createShipmentRes && !createShipmentRes.isSuccess){
        return next(new Error(createShipmentRes.body.message));
      }

      // change status of isAssignHub field
      order.isAssignHub = true;
      await order.save();
      
      return next();
    } else {
      return next(new Error("Order not found!"));
    }
  } catch (e) {
    return next(e);
  }
}

const removeDuplicates = (array, key) => {
  return array.reduce((arr, item) => {
      const removed = arr.filter(i => i[key] !== item[key]);
      return [...removed, item];
  }, []);
};
