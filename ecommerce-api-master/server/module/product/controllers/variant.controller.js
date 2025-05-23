const _ = require('lodash');
const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  price: Joi.number().required().messages({
    'number.base': `"price" bắt buộc phải là 1 số`,
    'number.empty': `"price" không được để trống`,
    'any.required': `Yêu cầu phải có "price"`
  }),
  salePrice: Joi.number().allow(null).optional().messages({
    'number.base': `"salePrice" bắt buộc phải là 1 số`
  }),
  stockQuantity: Joi.number().allow(null).optional().default(0).messages({
    'number.base': `"stockQuantity" bắt buộc phải là 1 số`
  }),
  specifications: Joi.array().items(Joi.object({
    key: Joi.string(),
    value: Joi.any()
  })).optional().default([]).messages({
    'array.base': `"specifications" bắt buộc phải là 1 mảng`,
    'array.empty': `"specifications" không được để trống`
  }),
  // stockQuantity: Joi.number().required(),
  options: Joi.array().items(Joi.object({
    optionKey: Joi.string(),
    key: Joi.string(),
    value: Joi.string(),
    displayText: Joi.string()
  })).optional().default([]).messages({
    'array.base': `"options" bắt buộc phải là 1 mảng`,
    'array.empty': `"options" không được để trống`
  }),
  digitalFileId: Joi.string().allow(null, '').optional().messages({
    'string.base': `"digitalFileId" bắt buộc phải là những ký tự`
  })
});

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.productVariantId || req.body.productVariantId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const productVariant = await DB.ProductVariant.findOne({ _id: id });
    if (!productVariant) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    if (req.user && productVariant.digitalFileId && (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || req.user.isShop)) {
      // product.digitalFile = await DB.Media.findOne({ _id: product.digitalFileId });
      const query = { _id: productVariant.productId };
      if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
        query.shopId = req.user.shopId;
      }
      const count = await DB.Product.countDocuments(query);
      // this is owner or admin of this product variant
      if (count > 0) {
        productVariant.digitalFile = await DB.Media.findOne({ _id: productVariant.digitalFileId });
      }
    }

    req.productVariant = productVariant;
    res.locals.productVariant = productVariant;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new productVariant
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const productVariant = new DB.ProductVariant(Object.assign(validate.value, {
      createdBy: req.user._id,
      updatedBy: req.user._id,
      productId: req.params.productId
    }));
    await productVariant.save();
    res.locals.productVariant = productVariant;
    return next();
  } catch (e) {
    return next(e);
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

    _.assign(req.productVariant, validate.value, {
      updatedBy: req.user._id
    });

    await req.productVariant.save();
    res.locals.update = req.productVariant;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await req.productVariant.remove();
    // TODO - update cound

    res.locals.remove = {
      message: 'Đã Xóa Thuộc Tính Sản Phẩm Này'
    };
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * get list productVariant
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = {
      productId: req.params.productId
    };

    const product = await DB.Product.findOne({ _id: req.params.productId });
    if (!product) {
      res.locals.productVariantList = {
        count: 0,
        items: []
      };
      return next();
    }

    const findQuery = DB.ProductVariant.find(query);
    if (req.user && product.type === 'digital' &&
      (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || (req.user.isShop && req.user.shopId.toString() === product.shopId.toString()))) {
      findQuery.populate('digitalFile');
    }

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.ProductVariant.countDocuments(query);
    const items = await findQuery
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    res.locals.productVariantList = {
      count,
      items
    };
    return next();
  } catch (e) {
    return next(e);
  }
};
