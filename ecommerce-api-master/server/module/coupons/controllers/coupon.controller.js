const _ = require('lodash');
const Joi = require('@hapi/joi');

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.couponId || req.body.couponId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const query = Helper.App.isMongoId(id) ? { _id: id } : { alias: id };
    const coupon = await DB.Coupon.findOne(query);
    if (!coupon) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.coupon = coupon;
    res.locals.coupon = coupon;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new media coupon
 */
exports.create = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      name: Joi.string().required().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
        'string.empty': `"name" không được để trống`,
        'any.required': `Yêu cầu phải có "name"`
      }),
      code: Joi.string().required().messages({
        'string.base': `"code" bắt buộc phải là những ký tự`,
        'string.empty': `"code" không được để trống`,
        'any.required': `Yêu cầu phải có "code"`
      }),
      discountPercentage: Joi.number().min(1).max(100).required().messages({
        'number.base': `"discountPercentage" bắt buộc phải là 1 số`,
        'number.empty': `"discountPercentage" không được để trống`,
        'any.required': `Yêu cầu phải có "discountPercentage"`
      }),
      limit: Joi.number().required().messages({
        'number.base': `"limit" bắt buộc phải là 1 số`,
        'number.empty': `"limit" không được để trống`,
        'any.required': `Yêu cầu phải có "limit"`
      }),
      expiredTime: Joi.string().allow(null).optional().messages({
        'string.base': `"expiredTime" bắt buộc phải là những ký tự`
      }),
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const count = await DB.Coupon.countDocuments({
      shopId: req.user.shopId,
      code: validate.value.code.toUpperCase()
    });
    if (count) {
      return next(PopulateResponse.error({
        message: `The code ${validate.value.code.toUpperCase()} has already taken`
      }));
    }

    const coupon = new DB.Coupon(Object.assign(validate.value, {
      shopId: req.user.shopId
    }));
    await coupon.save();
    res.locals.coupon = coupon;
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
    const validateSchema = Joi.object().keys({
      name: Joi.string().required().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
        'string.empty': `"name" không được để trống`,
        'any.required': `Yêu cầu phải có "name"`
      }),
      code: Joi.string().required().messages({
        'string.base': `"code" bắt buộc phải là những ký tự`,
        'string.empty': `"code" không được để trống`,
        'any.required': `Yêu cầu phải có "code"`
      }),
      discountPercentage: Joi.number().min(1).max(100).required().messages({
        'number.base': `"discountPercentage" bắt buộc phải là 1 số`,
        'number.empty': `"discountPercentage" không được để trống`,
        'any.required': `Yêu cầu phải có "discountPercentage"`
      }),
      limit: Joi.number().required().messages({
        'number.base': `"limit" bắt buộc phải là 1 số`,
        'number.empty': `"limit" không được để trống`,
        'any.required': `Yêu cầu phải có "limit"`
      }),
      expiredTime: Joi.string().allow(null).optional().messages({
        'string.base': `"expiredTime" bắt buộc phải là những ký tự`
      }),
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const count = await DB.Coupon.countDocuments({
      shopId: req.user.shopId,
      code: validate.value.code.toUpperCase(),
      _id: {
        $ne: req.coupon._id
      }
    });
    if (count) {
      return next(PopulateResponse.error({
        message: `The code ${validate.value.code.toUpperCase()} has already taken`
      }));
    }

    _.merge(req.coupon, validate.value);
    await req.coupon.save();
    res.locals.update = req.coupon;
    return next();
  } catch (e) {
    return next();
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) && req.user.shopId.toString() !== req.coupon.shopId.toString()) {
      return next(PopulateResponse.forbidden());
    }
    await req.coupon.remove();
    res.locals.remove = {
      message: 'Mã khuyến mãi đã được xóa'
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * get list coupon
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = {};
    query.shopId = !req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) ? req.user.shopId : req.query.shopId;
    if (req.query.q) {
      query.$or = [{
        name: { $regex: req.query.q.trim(), $options: 'i' }
      }, {
        code: { $regex: req.query.q.trim(), $options: 'i' }
      }];
    }

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.Coupon.countDocuments(query);
    const items = await DB.Coupon.find(query)
      .sort(sort).skip(page * take).limit(take)
      .exec();

    res.locals.list = {
      count,
      items
    };
    next();
  } catch (e) {
    next();
  }
};

exports.check = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      code: Joi.string().required().messages({
        'string.base': `"code" bắt buộc phải là những ký tự`,
        'string.empty': `"code" không được để trống`,
        'any.required': `Yêu cầu phải có "code"`
      }),
      shopId: Joi.string().required().messages({
        'string.base': `"shopId" bắt buộc phải là những ký tự`,
        'string.empty': `"shopId" không được để trống`,
        'any.required': `Yêu cầu phải có "shopId"`
      }),
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const coupon = await DB.Coupon.findOne({
      code: validate.value.code.toUpperCase().trim(),
      shopId: validate.value.shopId,
      $or: [{
        expiredTime: null
      }, {
        expiredTime: {
          $gt: new Date()
        }
      }]
    });

    if (!coupon) {
      return next(PopulateResponse.notFound());
    }

    if (coupon.limit && coupon.limit <= coupon.usedCount) {
      return next(PopulateResponse.error({
        message: 'Mã giảm giá đã hết hạn hoặc hết số lần sử dụng'
      }));
    }
    res.locals.check = coupon;
    return next();
  } catch (e) {
    return next(e);
  }
};
