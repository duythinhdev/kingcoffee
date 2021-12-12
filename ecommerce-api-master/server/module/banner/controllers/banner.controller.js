/* eslint no-param-reassign: 0 */
const _ = require('lodash');
const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  title: Joi.string().required().messages({
    'string.base': `"title" bắt buộc phải là những ký tự`,
    'string.empty': `"title" không được để trống`,
    'any.required': `Yêu cầu phải có "title"`
  }),
  content: Joi.string().allow(null, '').optional().messages({
    'string.base': `"content" bắt buộc phải là những ký tự`
  }),
  ordering: Joi.number().allow(null, '').optional().messages({
    'number.base': `"ordering" bắt buộc phải là 1 số`
  }),
  position: Joi.string().allow(null, '').optional().messages({
    'string.base': `"position" bắt buộc phải là những ký tự`
  }),
  mediaId: Joi.string().allow(null, '').optional().messages({
    'string.base': `"mediaId" bắt buộc phải là những ký tự`
  }),
  link: Joi.string().allow(null, '').optional().messages({
    'string.base': `"link" bắt buộc phải là những ký tự`
  }),
  meta: Joi.object().allow(null, '').optional().messages({
    'object.base': `"meta" bắt buộc phải là 1 object`
  }),
  isActive: Joi.boolean()
    .allow(null, "")
    .optional(),
});
exports.findOne = async (req, res, next) => {
  try {
    const banner = await DB.Banner.findOne({ _id: req.params.id })
      .populate('media');
    if (!banner) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.banner = banner;
    res.locals.banner = banner;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new banner
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const banner = new DB.Banner(validate.value);
    await banner.save();
    res.locals.banner = banner;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * do update for banner
 */
exports.update = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    _.assign(req.banner, validate.value);
    await req.banner.save();
    res.locals.update = req.banner;
    return next();
  } catch (e) {
    return next();
  }
};

exports.remove = async (req, res, next) => {
  try {
    await req.banner.remove();
    res.locals.remove = {
      message: 'Banner đã được xóa'
    };
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * get list banner
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['title'],
      equal: ['position']
    });

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.Banner.countDocuments(query);
    const items = await DB.Banner.find(query)
      .collation({ locale: 'en' })
      .sort(sort).skip(page * take)
      .limit(take)
      .populate('media')
      .exec();

    res.locals.bannerList = {
      count,
      items
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.random = async (req, res, next) => {
  try {
    const take = parseInt(req.query.take, 10) || 10;
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['title'],
      boolean: ['isActive'],
      equal: ['position']
    });
    const data = await DB.Banner.aggregate([
      { $match: query }
      //,{ $sample: { size: take } }
    ]).exec();

    if (!data || !data.length) {
      res.locals.bannerList = [];
      return next();
    }

    const mediaIds = data.map(item => item.mediaId);
    if (mediaIds.length) {
      const media = await DB.Media.find({ _id: { $in: mediaIds } });
      data.forEach((banner) => {
        if (banner.mediaId) {
          banner.media = media.find(f => f._id.toString() === banner.mediaId.toString());
        }
      });
    }

    res.locals.bannerList = data;
    return next();
  } catch (e) {
    return next(e);
  }
};
