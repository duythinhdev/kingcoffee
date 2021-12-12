const _ = require('lodash');
const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  name: Joi.string().required().messages({
    'string.base': `"name" bắt buộc phải là những ký tự`,
    'string.empty': `"name" không được để trống`,
    'any.required': `Yêu cầu phải có "name"`
  }),
  alias: Joi.string().allow(null, '').optional().messages({
    'string.base': `"alias" bắt buộc phải là những ký tự`
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': `"description" bắt buộc phải là những ký tự`
  }),
  ordering: Joi.number().allow(null, '').optional().messages({
    'string.base': `"ordering" bắt buộc phải là những ký tự`
  }),
}).unknown();

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.postCategoryId || req.body.postCategoryId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }

    const query = Helper.App.isMongoId(id) ? { _id: id } : { alias: id };
    const category = await DB.PostCategory.findOne(query);
    if (!category) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.postCategory = category;
    res.locals.postCategory = category;
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
    const count = await DB.PostCategory.countDocuments({ alias });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    const category = new DB.PostCategory(Object.assign(validate.value, {
      alias
    }));
    await category.save();
    res.locals.postCategory = category;
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

    let alias = validate.value.alias ? Helper.String.createAlias(validate.value.alias) : Helper.String.createAlias(validate.value.name);
    const count = await DB.PostCategory.countDocuments({
      alias,
      _id: { $ne: req.postCategory._id }
    });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    _.merge(req.postCategory, validate.value);
    await req.postCategory.save();
    res.locals.update = req.postCategory;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await req.postCategory.remove();
    await DB.Post.updateMany({
      categoryIds: {
        $in: [req.postCategory._id]
      }
    }, {
      $pull: {
        categoryIds: req.postCategory._id
      }
    });

    res.locals.remove = {
      message: 'Đã Xóa Thể Loại Bài Viết Này'
    };
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * get list category
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['name', 'alias']
    });

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.PostCategory.countDocuments(query);
    const items = await DB.PostCategory.find(query)
      .collation({ locale: 'en' })
      .sort(sort).skip(page * take)
      .limit(take)
      .exec();

    res.locals.list = { count, items };
    next();
  } catch (e) {
    next(e);
  }
};
