const _ = require('lodash');
const Joi = require('@hapi/joi');

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.shopFeaturedPackageId || req.body.shopFeaturedPackageId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const query = Helper.App.isMongoId(id) ? { _id: id } : { alias: id };
    const shopFeaturedPackage = await DB.ShopFeaturedPackage.findOne(query);
    if (!shopFeaturedPackage) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.shopFeaturedPackage = shopFeaturedPackage;
    res.locals.shopFeaturedPackage = shopFeaturedPackage;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new media shopFeaturedPackage
 */
exports.create = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      name: Joi.string().required().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
        'string.empty': `"name" không được để trống`,
        'any.required': `Yêu cầu phải có "name"`
      }),
      description: Joi.string().allow(null, '').optional().messages({
        'string.base': `"description" bắt buộc phải là những ký tự`
      }),
      price: Joi.number().required().messages({
        'number.base': `"price" bắt buộc phải là 1 số`,
        'number.empty': `"price" không được để trống`,
        'any.required': `Yêu cầu phải có "price"`
      }),
      numDays: Joi.number().required().messages({
        'number.base': `"numDays" bắt buộc phải là 1 số`,
        'number.empty': `"numDays" không được để trống`,
        'any.required': `Yêu cầu phải có "numDays"`
      }),
      ordering: Joi.number().optional().messages({
        'string.base': `"ordering" bắt buộc phải là những ký tự`,
        'string.empty': `"ordering" không được để trống`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const shopFeaturedPackage = new DB.ShopFeaturedPackage(validate.value);
    await shopFeaturedPackage.save();
    res.locals.shopFeaturedPackage = shopFeaturedPackage;
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
      description: Joi.string().allow(null, '').optional().messages({
        'string.base': `"description" bắt buộc phải là những ký tự`
      }),
      price: Joi.number().required().messages({
        'number.base': `"price" bắt buộc phải là 1 số`,
        'number.empty': `"price" không được để trống`,
        'any.required': `Yêu cầu phải có "price"`
      }),
      numDays: Joi.number().required().messages({
        'number.base': `"numDays" bắt buộc phải là 1 số`,
        'number.empty': `"numDays" không được để trống`,
        'any.required': `Yêu cầu phải có "numDays"`
      }),
      ordering: Joi.number().optional().messages({
        'string.base': `"ordering" bắt buộc phải là những ký tự`,
        'string.empty': `"ordering" không được để trống`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    _.merge(req.shopFeaturedPackage, validate.value);
    await req.shopFeaturedPackage.save();
    res.locals.update = req.shopFeaturedPackage;
    return next();
  } catch (e) {
    return next();
  }
};

exports.remove = async (req, res, next) => {
  try {
    await req.shopFeaturedPackage.remove();
    res.locals.remove = {
      message: 'Gói tính năng đã bị xóa'
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * get list shopFeaturedPackage
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = {};
    if (req.query.q) {
      query.$or = [{
        name: { $regex: req.query.q.trim(), $options: 'i' }
      }];
    }

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.ShopFeaturedPackage.countDocuments(query);
    const items = await DB.ShopFeaturedPackage.find(query)
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
