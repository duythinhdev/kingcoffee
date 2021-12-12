const _ = require('lodash');
const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  name: Joi.string().required().messages({
    'string.base': `"name" bắt buộc phải là những ký tự`,
    'any.required': `Yêu cầu phải có "name"`,
    'string.empty': `"name" không được để trống`
  }),
  alias: Joi.string().allow(null, '').optional().messages({
    'string.base': `"alias" bắt buộc phải là những ký tự`
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': `"description" bắt buộc phải là những ký tự`
  }),
  ordering: Joi.number().allow(null, '').optional().messages({
    'number.base': `"ordering" bắt buộc phải là 1 số`
  })
}).unknown();

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.mediaCategoryId || req.body.mediaCategoryId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const category = await DB.MediaCategory.findOne({ _id: id });
    if (!category) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.mediaCategory = category;
    res.locals.mediaCategory = category;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new media category
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    let alias = req.body.alias ? Helper.String.createAlias(req.body.alias) : Helper.String.createAlias(req.body.name);
    const count = await DB.MediaCategory.countDocuments({ alias });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    const category = new DB.MediaCategory(Object.assign(req.body, {
      alias
    }));
    await category.save();
    res.locals.mediaCategory = category;
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
    const count = await DB.MediaCategory.countDocuments({
      alias,
      _id: { $ne: req.mediaCategory._id }
    });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    _.merge(req.mediaCategory, req.body);
    await req.mediaCategory.save();
    res.locals.update = req.mediaCategory;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await req.mediaCategory.remove();
    await DB.Media.updateMany({
      categoryIds: {
        $in: [req.mediaCategory._id]
      }
    }, {
      $pull: {
        categoryIds: req.mediaCategory._id
      }
    });

    res.locals.remove = {
      message: 'Thể loại này đã bị xóa'
    };
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * get list category
 */
exports.search = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['name', 'alias']
    });

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.MediaCategory.countDocuments(query);
    const items = await DB.MediaCategory.find(query)
      .collation({ locale: 'en' })
      .sort(sort).skip(page * take)
      .limit(take)
      .exec();

    res.locals.search = {
      count,
      items
    };
    next();
  } catch (e) {
    next(e);
  }
};
