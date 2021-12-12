const _ = require('lodash');
const Joi = require('@hapi/joi');
const adminLog = require('../../adminlog');
const statusConfig = require('../index');
const numeral = require('numeral');
const axios = require('axios');
const Queue = require('../../../kernel/services/queue');
const invenQ = Queue.create('inven');
const https = require('https');

const productMinPrice = process.env.PRODUCT_MIN_PRICE;

const validateSchema = Joi.object().keys({
  name: Joi.string().required().messages({
    'string.base': '"name" bắt buộc phải là những ký tự',
    'string.empty': '"name" không được để trống',
    'any.required': 'Yêu cầu phải có "name"'
  }),
  weight: Joi.number().required().messages({
    'number.base': '"weight" bắt buộc phải là 1 số',
    'number.empty': '"weight" không được để trống',
    'any.required': 'Yêu cầu phải có "weight"'
  }),
  alias: Joi.string().allow(null, '').optional().messages({
    'string.base': '"alias" bắt buộc phải là những ký tự'
  }),
  type: Joi.string().allow('physical', 'digital').optional().messages({
    'string.base': '"type" bắt buộc phải là những ký tự',
    'string.empty': '"type" không được để trống'
  }),
  shortDescription: Joi.string().allow(null, '').optional().messages({
    'string.base': '"shortDescription" bắt buộc phải là những ký tự'
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': '"description" bắt buộc phải là những ký tự'
  }),
  ordering: Joi.number().allow(null, '').optional().messages({
    'number.base': '"ordering" bắt buộc phải là 1 số'
  }),
  categoryId: Joi.string().required().messages({
    'string.empty': '"bắt buộc phải thuộc về 1 category"',
    'string.base': '"categoryId" bắt buộc phải là những ký tự'
  }),
  shopId: Joi.string().allow(null, '').optional().messages({
    'string.base': '"shopId" bắt buộc phải là những ký tự'
  }),
  price: Joi.number().optional().messages({
    'number.base': '"price" bắt buộc phải là 1 số',
    'number.empty': '"price" không được để trống'
  }),
  salePrice: Joi.number().allow(null).optional().messages({
    'number.base': '"salePrice" bắt buộc phải là 1 số'
  }),
  mainImage: Joi.string().allow(null, '').optional().messages({
    'string.base': '"mainImage" bắt buộc phải là những ký tự',
    'string.empty': 'hình ảnh chính không được để trống'
  }),
  images: Joi.array().items(Joi.string()).optional().messages({
    'array.base': '"images" bắt buộc phải là 1 mảng',
    'array.empty': '"images" không được để trống'
  }),
  specifications: Joi.array().items(Joi.object({
    key: Joi.string(),
    value: Joi.any()
  })).optional().default([])
    .messages({
      'array.base': '"specifications" bắt buộc phải là 1 mảng',
      'array.empty': '"specifications" không được để trống'
    }),
  featured: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"featured" chỉ có thế là \'true\' hoặc \'false\''
  }), // for admin only
  hot: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"hot" chỉ có thế là \'true\' hoặc \'false\''
  }), // for admin only
  bestSell: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"bestSell" chỉ có thế là \'true\' hoặc \'false\''
  }), // for admin only
  isActive: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"isActive" chỉ có thế là \'true\' hoặc \'false\''
  }),
  isTradeDiscount: Joi.boolean().optional().messages({
    'boolean.base': '"isTradeDiscount" chỉ có thế là \'true\' hoặc \'false\''
  }),
  stockQuantity: Joi.number().optional().messages({
    'number.base': '"stockQuantity" bắt buộc phải là 1 số',
    'number.empty': '"stockQuantity" không được để trống'
  }),
  sku: Joi.string().allow(null, '').optional().messages({
    'string.base': '"sku" bắt buộc phải là 1 những ký tự'
  }),
  upc: Joi.string().allow(null, '').optional().messages({
    'string.base': '"upc" bắt buộc phải là những ký tự'
  }),
  mpn: Joi.string().allow(null, '').optional().messages({
    'string.base': '"mpn" bắt buộc phải là những ký tự'
  }),
  ean: Joi.string().allow(null, '').optional().messages({
    'string.base': '"ean" bắt buộc phải là những ký tự'
  }),
  jan: Joi.string().allow(null, '').optional().messages({
    'string.base': '"jan" bắt buộc phải là những ký tự'
  }),
  isbn: Joi.string().allow(null, '').optional().messages({
    'string.base': '"isbn" bắt buộc phải là những ký tự'
  }),
  taxClass: Joi.string().allow(null, '').optional().messages({
    'string.base': '"taxClass" bắt buộc phải là những ký tự'
  }),
  taxPercentage: Joi.number().allow(null).optional().messages({
    'number.base': '"taxPercentage" bắt buộc phải là 1 số'
  }),
  digitalFileId: Joi.string().allow(null, '').optional().messages({
    'string.base': '"taxClass" bắt buộc phải là những ký tự'
  }),
  dailyDeal: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"dailyDeal" chỉ có thế là \'true\' hoặc \'false\''
  }),
  dealTo: Joi.string().allow(null, '').optional().messages({
    'string.base': '"taxClass" bắt buộc phải là những ký tự'
  }),
  freeShip: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"freeShip" chỉ có thế là \'true\' hoặc \'false\''
  }),
  restrictCODAreas: Joi.array().items(Joi.string()).optional().messages({
    'string.base': '"taxClass" bắt buộc phải là những ký tự'
  }),
  restrictFreeShipAreas: Joi.array().items(Joi.object().keys({
    areaType: Joi.string().allow('zipCode', 'city', 'state', 'country').optional().messages({
      'string.base': '"areaType" bắt buộc phải là những ký tự',
      'string.empty': '"areaType" không được để trống'
    }),
    value: Joi.string(),
    name: Joi.string()
  })).optional().messages({
    'array.base': '"restrictFreeShipAreas" bắt buộc phải là 1 mảng',
    'array.empty': '"restrictFreeShipAreas" không được để trống'
  }),
  metaSeo: Joi.object().keys({
    keywords: Joi.string().allow(null, '').optional().messages({
      'string.base': '"keywords" bắt buộc phải là 1 những ký tự'
    }),
    description: Joi.string().allow(null, '').optional().messages({
      'string.base': '"description" bắt buộc phải là những ký tự'
    })
  }).optional(),
  fiveElement: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"fiveElement" chỉ có thế là \'true\' hoặc \'false\''
  }),
  status: Joi.number().allow(null).optional().messages({
    'number.base': '"status" bắt buộc phải là 1 số'
  }),
  note: Joi.string().allow(null, '').optional().messages({
    'string.base': '"note" bắt buộc phải là những ký tự'
  }),
  producer: Joi.string().allow(null, '').optional().messages({
    'string.base': '"producer" bắt buộc phải là những ký tự'
  }),
  country: Joi.string().allow(null, '').optional().messages({
    'string.base': '"country" bắt buộc phải là những ký tự'
  }),
  lang: Joi.string().allow(null, '').optional().messages({
    'string.base': '"lang" bắt buộc phải là những ký tự'
  }),
  packingSpecifications: Joi.number().allow(null).optional().messages({
    'number.base': '"packingSpecifications" bắt buộc phải là 1 số'
  }),
  sap: Joi.string().allow(null).optional().messages({
    'string.base': '"sap" bắt buộc phải là những ký tự'
  }),
  expiryDate: Joi.number().allow(null).optional().messages({
    'number.base': '"expiryDate" bắt buộc phải là 1 số'
  }),
  unitPrice: Joi.string().allow('bag', 'package', 'box').optional().messages({
    'string.base': '"unitPrice" bắt buộc phải là những ký tự',
    'string.empty': '"unitPrice" không được để trống'
  }),
  unitSalePrice: Joi.string().allow('bag', 'package', 'box').optional().messages({
    'string.base': '"unitSalePrice" bắt buộc phải là những ký tự',
    'string.empty': '"unitSalePrice" không được để trống'
  }),
  isPromotion: Joi.boolean().allow(null).optional().messages({
    'boolean.base': '"isPromotion" chỉ có thế là \'true\' hoặc \'false\''
  }),
  // configs: Joi.object().keys({
  //   isTradeDiscountSeller: Joi.boolean().required().messages({
  //     'boolean.base': '"isTradeDiscountSeller" chỉ có thế là \'true\' hoặc \'false\'',
  //     'any.required': 'Yêu cầu phải có "isTradeDiscountSeller"'
  //   }),
  //   tradeDiscountGoldtime: Joi.number().required().messages({
  //     'number.base': '"tradeDiscountGoldtime" bắt buộc phải là 1 số',
  //     'any.required': 'Yêu cầu phải có "tradeDiscountGoldtime"'
  //   })
  // }).required()
});

const getConfigTradeDiscount = async (params) => {
  try {
    const getConfig = await DB.Config.findOne({ key: 'tradeDiscount' });
    if (!getConfig) {
      throw new Error('Không tìm thấy chiết khấu!');
    }

    const data = {
      tradeDiscountGoldtime: params.tradeDiscountGoldtime,
      tradeDiscountUser: getConfig.value.tradeDiscountUser
    };

    if (params.isTradeDiscountSeller) {
      data.tradeDiscountSeller = getConfig.value.tradeDiscountSeller;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.productId || req.body.productId;
    const query = {};
    if (Helper.App.isMongoId(id)) {
      query._id = id;
    } else {
      query.alias = id;
    }
    query.isDeleted = false;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const product = await DB.Product.findOne(query);

    if (!product) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    //get can apply promotion list
    const promotions = await Service.Promotion.getProductDetailPromotions(product, req.user, null);

    product.promotions = promotions ? promotions : null;
    await product.populate('promotions').execPopulate();

    req.product = product;
    res.locals.product = product;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new media product
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    // if (!validate.value.price || validate.value.price < productMinPrice) {
    //   throw new Error(`Giá không được thấp hơn ${numeral(productMinPrice).format('0,0')}đ`);
    // }

    if (validate.value.isPromotion) {
      if (validate.value.price !== 0 || validate.value.salePrice !== 0) {
        throw new Error(`Sản phẩm khuyến mãi giá phải là 0đ`);
      }
    }

    if (!validate.value.isPromotion) {
      if (validate.value.price <= 0 || validate.value.salePrice <= 0) {
        throw new Error(`Giá phải lớn hơn 0đ`);
      }
    }

    // if (!validate.value.salePrice || validate.value.salePrice < productMinPrice) {
    //   throw new Error(`Giá bán không được thấp hơn ${numeral(productMinPrice).format('0,0')}đ`);
    // }

    if (validate.value.mainImage && validate.value.mainImage === '') {
      throw new Error('Bắt buộc phải có hình ảnh sản phẩm');
    } else if (!validate.value.images || validate.value.images.length === 0) {
      throw new Error('Bắt buộc phải có hình ảnh sản phẩm');
    }

    if (validate.value.dealTo) {
      const dealTo = (Date.parse(validate.value.dealTo) / 1000) + 24 * 60 * 60 - 1;
      const now = Date.now() / 1000;
      if (dealTo < now) {
        throw new Error('Không thể thiết lập Deal ngày trong quá khứ');
      }
    }

    let alias = req.body.alias ? Helper.String.createAlias(req.body.alias) : Helper.String.createAlias(req.body.name);
    const count = await DB.Product.countDocuments({ alias });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      // validate.value = _.omit(validate.value, [
      //   'featured', 'hot', 'bestSell', 'fiveElement'
      // ]);
      validate.value = _.omit(validate.value, [
        'featured', 'hot', 'bestSell'
      ]);
    }

    // // ngũ hành tương sinh
    // if (validate.value.fiveElement && validate.value.isActive) {
    //   const count = await DB.Product.countDocuments({
    //     fiveElement: true,
    //     isActive: true
    //   });

    //   if (count > 0) {
    //     return next(PopulateResponse.error(null, 'Có sự kiện ngũ hành khác đang hoạt động. Không thể kích hoạt sự kiện này.'));
    //   }
    // }

    const findProduct = await DB.Product.find({ sap: req.body.sap });
    if (findProduct.length > 0) {
      // res.locals.product = { message: "SKU này đã tồn tại" };
      return next(PopulateResponse.error(null, 'SAP này đã tồn tại'));
    }

    let shopId = req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) ? req.body.shopId : req.user.shopId;
    // special case
    if (req.headers.platform === 'seller' && req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      shopId = req.user.shopId;
    }

    if (!shopId) {
      return next(PopulateResponse.error(null, 'Không tìm thấy cửa hàng'));
    }

    // // get config trade discount
    // const { configs } = validate.value;
    // const objConfig = await getConfigTradeDiscount(configs);

    Helper.Utils.markNullEmpty(validate.value, ['categoryId']);
    const product = new DB.Product(Object.assign(validate.value, {
      alias,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      shopId,
      currency: process.env.SITE_CURRENCY
    }));
    // product.discounted = product.salePrice < product.price;
    // product.configs = objConfig;

    if (product.categoryId) {
      const categoryId = Helper.App.isMongoId(product.categoryId) ? product.categoryId : Helper.App.toObjectId(product.categoryId);
      const getCategoryType = await DB.ProductCategory.findOne({ _id: categoryId });
      if (getCategoryType) {
        product.type = getCategoryType.type;
        if (product.isPromotion && !getCategoryType.isPromotion) {
          throw new Error('Vui lòng chọn category khuyến mãi cho sản phẩm khuyến mãi');
        }
      }
    }

    if (findProduct.sap) await product.save();

    // if (product.fiveElement) {
    //   await Service.Event.initEventRootNode({
    //     productId: product._id,
    //     ownerId: req.user._id
    //   });
    // }

    //Call service sync data product for Inventory
    invenQ.createJob().save();
    //await Service.Product.asyncProductDataForInventory();

    // logging
    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      //// Sau này nếu có nhiều shop thì thì mở điều kiện thì ra - gán shopId này vào username = "0987654321"
      // const owner = await DB.User.findOne({ shopId: req.body.shopId });
      // if (!owner) {
      //   throw new Error('Không tìm thấy thông tin chủ cửa hàng');
      // }

      await Service.AdminLog.create(req.user.username, `${req.user.username} đã tạo sản phẩm ${req.body.name}`, adminLog.status.Added);
    }

    res.locals.product = await Service.Product.updateShopStatus(product);
    await this.crmProductSync(product);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.crmProductSync = async (product) => {
  try {
    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    const params = new URLSearchParams()
    params.append('id', product.sap);
    params.append('product_name', product.name);
    params.append('category', product.type);
    params.append('sku', product.sap);
    params.append('price', product.salePrice);
    params.append('list_price', product.price);
    params.append('image', product.mainImage);

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const res = await instance.post(`${process.env.CRM_API}/tcoqcode_api/sync_product/`, params, config);
    console.log('Res: ', res);
    if (res.status !== 200){
      throw new Error(`Không đồng bộ sản phẩm với CRM được`);
    }
  } catch (e) {
    throw new Error(`Không đồng bộ sản phẩm với CRM được`);
  }
};

/**
 * do update for user profile or admin update
 */
exports.update = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    if (validate.value.sap !== req.product.sap) {
      throw new Error(`Không được thay đổi SAP của sản phẩm`);
    }

    // if (!validate.value.price || validate.value.price < productMinPrice) {
    //   throw new Error(`Giá không được thấp hơn ${numeral(productMinPrice).format('0,0')}đ`);
    // }

    // if (!validate.value.salePrice || validate.value.salePrice < productMinPrice) {
    //   throw new Error(`Giá bán không được thấp hơn ${numeral(productMinPrice).format('0,0')}đ`);
    // }

    if (validate.value.isPromotion) {
      if (validate.value.price !== 0 || validate.value.salePrice !== 0) {
        throw new Error(`Sản phẩm khuyến mãi giá phải là 0đ`);
      }
    }

    if (!validate.value.isPromotion) {
      if (validate.value.price <= 0 || validate.value.salePrice <= 0) {
        throw new Error(`Giá phải lớn hơn 0đ`);
      }
    }

    if (validate.value.mainImage && validate.value.mainImage === '') {
      throw new Error('Bắt buộc phải có hình ảnh sản phẩm');
    } else if (validate.value.images && validate.value.images.length === 0) {
      throw new Error('Bắt buộc phải có hình ảnh sản phẩm');
    }

    if (validate.value.dailyDeal && validate.value.dealTo) {
      const dealTo = (Date.parse(validate.value.dealTo) / 1000) + 24 * 60 * 60 - 1;
      const now = Date.now() / 1000;
      if (dealTo < now) {
        throw new Error('Không thể thiết lập Deal ngày trong quá khứ');
      }
    }

    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      // validate.value = _.omit(validate.value, [
      //   'fiveElement'
      // ]);
    }

    // // ngũ hành tương sinh
    // if (validate.value.isActive) {
    //   if ((validate.value.fiveElement !== undefined && validate.value.fiveElement) || (validate.value.fiveElement === undefined && req.product.fiveElement)) {
    //     const count = await DB.Product.countDocuments({
    //       fiveElement: true,
    //       isActive: true,
    //       _id: { $ne: req.product._id }
    //     });

    //     if (count > 0) {
    //       return next(PopulateResponse.error(null, 'Có sự kiện ngũ hành khác đang hoạt động. Không thể kích hoạt sự kiện này.'));
    //     }
    //   }
    // }

    const oldProduct = JSON.parse(JSON.stringify(req.product));

    let alias = req.body.alias ? Helper.String.createAlias(req.body.alias) : Helper.String.createAlias(req.body.name);
    const count = await DB.Product.countDocuments({
      alias,
      _id: { $ne: req.product._id }
    });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    const dupplicatedProducts = await DB.Product.find({ _id: { $nin: [req.product._id] }, sap: validate.value.sap });
    if (dupplicatedProducts.length > 0) {
      return next(PopulateResponse.error(null, 'SAP này đã tồn tại'));
    }
    if (validate.value.categoryId) {
      const categoryId = Helper.App.isMongoId(req.body.categoryId) ? req.body.categoryId : Helper.App.toObjectId(req.body.categoryId);
      const getCategoryType = await DB.ProductCategory.findOne({ _id: categoryId });
      if (getCategoryType && getCategoryType.type !== req.body.type) {
        validate.value.type = getCategoryType.type;
        if (validate.value.isPromotion && !getCategoryType.isPromotion) {
          throw new Error('Vui lòng chọn category khuyến mãi cho sản phẩm khuyến mãi');
        }
      }
    }

    Helper.Utils.markNullEmpty(validate.value, ['categoryId']);
    _.assign(req.product, validate.value, {
      updatedBy: req.user._id
    });

    // // get config trade discount
    // const { configs } = validate.value;
    // const objConfig = await getConfigTradeDiscount(configs);
    // req.product.configs = objConfig;

    // logging
    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      // Sau này nếu có nhiều shop thì thì mở điều kiện thì ra
      // const owner = await DB.User.findOne({ shopId: req.product.shopId });
      // if (!owner) {
      //   return next(PopulateResponse.error(null, 'Không tìm thấy thông tin chủ cửa hàng'));
      // }

      if (validate.value.isActive !== undefined && oldProduct.isActive !== validate.value.isActive) {
        const text = validate.value.isActive ? 'đã kích hoạt sản phẩm' : 'đã bỏ kích hoạt sản phẩm';
        await Service.AdminLog.create(req.user.username, `${req.user.username} ${text} ${req.body.name}`, adminLog.status.Changed);
        if (validate.value.isActive) {
          req.product.status = statusConfig.status.success;
          req.product.note = '';
          validate.value.status = statusConfig.status.success;
        }
      }

      if (validate.value.status === statusConfig.status.reject) {
        if (!validate.value.note) {
          return next(PopulateResponse.error(null, 'Yêu cầu bạn nhập lý do không duyệt sản phẩm!'));
        }
        req.product.isActive = false;
      }

      // if (oldProduct.configs.tradeDiscountSeller !== objConfig.tradeDiscountSeller) {
      // const text = validate.value.configs.isTradeDiscountSeller ? 'đã kích hoạt Chiết khấu chuỗi phân phối sản phẩm' : 'đã bỏ kích hoạt Chiết khấu chuỗi phân phối sản phẩm';
      // await Service.AdminLog.create(owner.username, `${req.user.username} ${text} ${req.body.name}`, adminLog.status.Changed);
      // }
    }

    // req.product.discounted = req.product.salePrice < req.product.price;
    await req.product.save();
    res.locals.update = await Service.Product.updateShopStatus(req.product);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    req.product.isDeleted = true;
    await req.product.save();
    // TODO - update cound

    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      // const owner = await DB.User.findOne({ shopId: req.product.shopId });
      // if (!owner) {
      //   throw new Error('Không tìm thấy thông tin chủ cửa hàng');
      // }

      await Service.AdminLog.create(req.user.username, `${req.user.username} đã xóa sản phẩm ${req.product.name}`, adminLog.status.Deleted);
    }

    res.locals.remove = {
      message: 'Đã Xóa Sản Phẩm'
    };
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * get list product
 */
exports.search = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    let query = {};
    query = Helper.App.populateDbQuery(req.query, {
      text: ['name', 'alias', 'shortDescription', 'sap'],
      boolean: ['featured', 'isActive', 'hot', 'bestSell', 'dailyDeal', 'discounted', 'soldOut', 'isPromotion'],
      equal: ['status']
    });
    query.isDeleted = false;
    // // remove fiveElement product(ticket) if not admin
    // if (req.headers.platform !== 'admin') {
    //   query.fiveElement = false;
    // }

    if (req.query.categoryId) {
      // TODO - optimize me by check in the cache
      // const categories = await DB.ProductCategory.find();
      // const category = categories.find(item => ([item.alias, item._id.toString()].indexOf(req.query.categoryId)) > -1);

      // if (category) {
      //   const tree = Helper.Utils.unflatten(categories.map(c => c.toJSON()));
      //   const root = Helper.Utils.findChildNode(tree, category._id);

      //   query.categoryId = {
      //     $in: !root ? [category._id] : Helper.Utils.flatten(root).map(item => item._id)
      //   };
      // }

      query.categoryId = req.query.categoryId;
    }

    let defaultSort = true;
    if (['seller', 'admin'].indexOf(req.headers.platform) === -1) {
      query.isActive = true;
      query.shopVerified = true;
      query.shopActivated = true;
      defaultSort = false;
      query.isPromotion = { '$in': [false, null] }
    } else if (req.headers.platform === 'seller' && req.user && req.user.isShop) {
      // from seller platform, just show seller products
      query.shopId = req.user.shopId;
    }
    if (req.headers.platform !== 'seller' && req.query.shopId) {
      query.shopId = Helper.App.toObjectId(req.query.shopId);
    }

    if (req.query.q) {
      query.alias = { $regex: Helper.App.removeAccents(req.query.q.trim().toLowerCase()), $options: 'i' };
    }

    if (query.dailyDeal && ['false', '0'].indexOf(query.dailyDeal) === -1) {
      query.dailyDeal = true;
    }

    if (req.query.type) {
      query.type = req.query.type;
    }

    const sort = Object.assign(Helper.App.populateDBSort(req.query), defaultSort ? {} : {
      shopFeatured: -1
    });
    const count = await DB.Product.count(query);

    if (req.query.sort === 'random') {
      const randomData = await DB.Product.aggregate([{
        $match: query
      }, {
        $sample: { size: take }
      }, {
        $project: { _id: 1 }
      }]);
      if (randomData && randomData.length) {
        query = {
          _id: {
            $in: randomData.map(p => p._id)
          }
        };
      }
    }

    const items = await DB.Product.find(query)
      .populate({
        path: 'mainImage',
        select: '_id filePath mediumPath thumbPath uploaded type'
      })
      .populate({
        path: 'category',
        select: '_id name mainImage totalProduct parentId'
      })
      .populate('promotions')
      //.populate('shop')
      .collation({ locale: 'vi' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    for (let product of items) {
      //get can apply promotion list
      const promotions = await Service.Promotion.getProductDetailPromotions(product, req.user, null);
      product.promotions = promotions ? promotions : null;
      await product.populate('promotions').execPopulate();
    }

    res.locals.search = {
      count,
      items
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getCountry = async (req, res, next) => {
  try {
    const instance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });
    const { data } = await instance.get(`${process.env.INVEST_API}/api/v1/Location/GetAllCountries`)
    // const { data } = await axios.get(`${process.env.INVEST_API}/api/v1/Location/GetAllCountries`)
    res.locals.search = {
      country: data.Data
    }
    return next();
  } catch (e) {
    return next(e);
  }
}

exports.details = async (req, res, next) => {
  try {
    const id = req.params.id;
    const query = {};
    if (Helper.App.isMongoId(id)) {
      query._id = id;
    } else {
      query.alias = id;
    }
    const product = await DB.Product.findOne(query)
      .populate({
        path: 'mainImage',
        select: '_id filePath mediumPath thumbPath type uploaded'
      })
      .populate({
        path: 'images',
        select: '_id filePath mediumPath thumbPath type uploaded'
      })
      .populate({
        path: 'category',
        select: '_id name mainImage totalProduct parentId'
      })
      .exec();

    // TODO - should populate product category for the breadcrumbs
    if (!product) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    //get can apply promotion list
    const promotions = await Service.Promotion.getProductDetailPromotions(product, req.user, null);

    product.promotions = promotions ? promotions : null;
    await product.populate('promotions').execPopulate();

    // if (req.user && product.type === 'digital' && product.digitalFileId &&
    //   (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || (req.user.isShop && req.user.shopId && req.user.shopId.toString() === product.shopId.toString()))) {
    //   product.digitalFile = await DB.Media.findOne({ _id: product.digitalFileId });
    // }

    // const [shop, eventProduct] = await Promise.all([
    //   DB.Shop.findOne({ _id: product.shopId })
    //     .populate({ path: 'owner', select: 'username' })
    //     .exec(),
    //   DB.EventProduct.findOne({status: true, productId: product._id }, { _id: 1 })
    // ]);

    // const objConfigs = { tradeDiscountGoldtime: product.configs.tradeDiscountGoldtime };
    // if (product.configs.tradeDiscountSeller) {
    //   objConfigs.isTradeDiscountSeller = true;
    // } else {
    //   objConfigs.isTradeDiscountSeller = false;
    // }

    //const p = product.toObject();
    //p.configs = objConfigs;
    //p.shop.username = shop.owner.username;
    //p.isVoucher = !!eventProduct;
    res.locals.product = product;

    return next();
  } catch (e) {
    return next(e);
  }
};

exports.fiveElementActive = async (req, res, next) => {
  try {
    const query = {
      fiveElement: true,
      isActive: true
    };

    const product = await DB.Product.findOne(query)
      .populate({
        path: 'mainImage',
        select: '_id filePath mediumPath thumbPath type uploaded'
      })
      .populate({
        path: 'images',
        select: '_id filePath mediumPath thumbPath type uploaded'
      })
      .populate({
        path: 'category',
        select: '_id name mainImage totalProduct parentId'
      })
      .populate({
        path: 'shop',
        select: '-verificationIssue -bankInfo -verificationIssueId'
      })
      .exec();

    // TODO - should populate product category for the breadcrumbs
    if (!product) {
      return res.status(200).send(PopulateResponse.success(null, 'Sản phẩm Ngũ Hành Tương Sinh chưa được kích hoạt'));
    }

    if (req.user && product.type === 'digital' && product.digitalFileId &&
      (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || (req.user.isShop && req.user.shopId && req.user.shopId.toString() === product.shopId.toString()))) {
      product.digitalFile = await DB.Media.findOne({ _id: product.digitalFileId });
    }

    const shop = await DB.Shop.findOne({ _id: product.shopId })
      .populate({
        path: 'owner',
        select: 'username'
      })
      .exec();

    const p = product.toObject();
    p.shop.username = shop.owner.username;
    req.product = p;
    res.locals.product = p;

    return next();
  } catch (e) {
    return next(e);
  }
};

exports.related = async (req, res, next) => {
  try {
    const query = {
      _id: {
        $ne: req.product._id
      },
      isActive: true,
      isDeleted: false,
      shopVerified: true,
      shopActivated: true
    };
    if (req.product.categoryId) {
      // TODO - optimize me by check in the cache
      // const categories = await DB.ProductCategory.find();
      // const category = categories.find(item => ([item.alias, item._id.toString()].indexOf(req.query.categoryId)) > -1);
      // if (category) {
      //   const tree = Helper.Utils.unflatten(categories.map(c => c.toJSON()));
      //   const root = Helper.Utils.findChildNode(tree, category._id);

      //   query.categoryId = {
      //     $in: !root ? [category._id] : Helper.Utils.flatten(root).map(item => item._id)
      //   };
      // }

      query.categoryId = req.product.categoryId;
    }

    const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(req.query.take, 10) || 10;
    // change to random
    // const randomData = await DB.Product.aggregate([
    //   { $sample: { size: take } },
    //   { $project: { _id: 1 } }
    // ]);
    // if (randomData && randomData.length) {
    //   query._id = {
    //     $in: randomData.map(p => p._id)
    //   };
    // }

    const sort = Object.assign({
      shopFeatured: -1
    }, Helper.App.populateDBSort(req.query));
    let items = await DB.Product.find(query)
      .populate({
        path: 'mainImage',
        select: '_id filePath mediumPath thumbPath uploaded type'
      })
      .populate({
        path: 'category',
        select: '_id name mainImage totalProduct parentId'
      })
      .populate('shop')
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    for (let product of items) {
      //get can apply promotion list
      const promotions = await Service.Promotion.getProductDetailPromotions(product, req.user, null);
      product.promotions = promotions ? promotions : null;
      await product.populate('promotions').execPopulate();
    }

    res.locals.items = items;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.checkAlias = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      alias: Joi.string().required()
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    const alias = Helper.String.createAlias(validate.value.alias);
    const count = await DB.Product.findOne({ alias });
    res.locals.checkAlias = {
      exist: count > 0
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getEventProducts = async (req, res, next) => {
  try {
    const products = await DB.EventProduct.find({ status: true }).sort({ createdAt: 1 })
      .populate('product', '_id name');
    res.locals.eventProducts = products;
    return next();
  } catch (e) {
    return next(e);
  }
};

invenQ.process(async (job, done) => {
  try {
    const res = await Service.Product.syncProductDataForInventory();
    if (res) {
      await Service.OrderLog.create({
        eventType: "asyncProductData",
        description: "Async product data",
        newData: res
      });
    }
  } catch (e) {
    // TODO - log error here
    console.log('async product failed', e);
  }
  done();
});

exports.updateAliasForAllProduct = async (req, res, next) => {
  try {
    await Service.Product.updateAliasForAllProduct();
    return next();
  } catch (e) {
    return next(e);
  }
};