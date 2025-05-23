const _ = require('lodash');
const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  name: Joi.string().required().messages({
    'string.base': `"name" bắt buộc phải là những ký tự`,
    'string.empty': `"name" không được để trống`,
    'any.required': `Yêu cầu phải có "name"`
  }),
  alias: Joi.string().allow(null, '').optional().messages({
    'string.base': `"alias" bắt buộc phải là những ký tự`,
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': `"description" bắt buộc phải là những ký tự`,
  }),
  logo: Joi.string().allow(null, '').optional().messages({
    'string.base': `"logo" bắt buộc phải là những ký tự`,
  }),
  ordering: Joi.number().allow(null, '').optional().messages({
    'number.base': `"ordering" bắt buộc phải là 1 số`,
  }),
});

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.brandId || req.body.brandId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const brand = await DB.Brand.findOne({ _id: id })
      .populate('logo');
    if (!brand) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.brand = brand;
    res.locals.brand = brand;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new media brand
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    let alias = req.body.alias ? Helper.String.createAlias(req.body.alias) : Helper.String.createAlias(req.body.name);
    const count = await DB.Brand.countDocuments({ alias });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    const brand = new DB.Brand(Object.assign(req.body, {
      alias
    }));
    await brand.save();
    res.locals.brand = brand;
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

    let alias = req.body.alias ? Helper.String.createAlias(req.body.alias) : Helper.String.createAlias(req.body.name);
    const count = await DB.Brand.countDocuments({
      alias,
      _id: { $ne: req.brand._id }
    });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    _.assign(req.brand, req.body);
    await req.brand.save();
    res.locals.update = req.brand;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await req.brand.remove();
    await DB.Product.updateMany({
      brandId: req.brand._id
    }, {
      $set: {
        brandId: null
      }
    });

    res.locals.remove = {
      message: 'Đã Xóa Thương Hiệu Này'
    };
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * get list brand
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['name', 'alias']
    });

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.Brand.countDocuments(query);
    const items = await DB.Brand.find(query)
      .collation({ locale: 'en' })
      .populate('logo')
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    res.locals.brandList = {
      count,
      items
    };
    next();
  } catch (e) {
    next(e);
  }
};
