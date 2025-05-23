const fs = require('fs');
const path = require('path');
const Joi = require('@hapi/joi');
const _ = require('lodash');

/**
 * do upload a photo
 */
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(PopulateResponse.error({
        message: 'Xin vui lòng tải file lên'
      }, 'CHƯA CÓ FILE'));
    }

    const schema = Joi.object().keys({
      name: Joi.string().allow('', null).optional().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
      }),
      description: Joi.string().allow('', null).optional().messages({
        'string.base': `"description" bắt buộc phải là những ký tự`,
      }),
      categoryIds: Joi.array().items(Joi.string()).optional().default([]).messages({
        'array.base': `"categoryIds" bắt buộc phải là 1 mảng`,
      }),
      systemType: Joi.string().allow('', null).optional().messages({
        'string.base': `"systemType" bắt buộc phải là những ký tự`,
      }),
    }).unknown();

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const file = await Service.Media.createFile({
      value: validate.value,
      user: req.user,
      file: req.file
    });

    res.locals.file = file;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * find media and add to req
 */
exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.mediaId || req.params.photoId || req.params.videoId || req.body.mediaId || req.body.photoId || req.body.videoId;
    if (!id) {
      return next(PopulateResponse.notFound());
    }

    const media = await DB.Media.findOne({ _id: id });
    if (!media) {
      return next(PopulateResponse.notFound());
    }
    res.locals.media = media;
    req.media = media;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * find media and add to req
 */
exports.search = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['name', 'description'],
      equal: ['type', 'ownerId', 'uploaderId']
    });

    if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      query.ownerId = req.user._id;
    }

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.Media.countDocuments(query);
    const items = await DB.Media.find(query)
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

exports.validatePermission = async (req, res, next) => {
  if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) && req.user._id.toString() !== req.media.ownerId.toString()) {
    return next(PopulateResponse.forbidden());
  }

  return next();
};

/**
 * delete a media and relaed data
 */
exports.remove = async (req, res, next) => {
  try {
    await req.media.remove();
    if (req.media.filePath && fs.existsSync(path.resolve(req.media.filePath))) {
      fs.unlinkSync(path.resolve(req.media.filePath));
    }
    if (req.media.thumbPath && fs.existsSync(path.resolve(req.media.thumbPath))) {
      fs.unlinkSync(path.resolve(req.media.thumbPath));
    }
    if (req.media.mediumPath && fs.existsSync(path.resolve(req.media.mediumPath))) {
      fs.unlinkSync(path.resolve(req.media.mediumPath));
    }

    res.locals.remove = { success: true, message: "Xóa Thành Công"};
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * delete a media and relaed data
 */
exports.update = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      name: Joi.string().allow('', null).optional().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
      }),
      description: Joi.string().allow('', null).optional().messages({
        'string.base': `"description" bắt buộc phải là những ký tự`,
      }),
      categoryIds: Joi.array().items(Joi.string()).optional().default([]).messages({
        'array.base': `"categoryIds" bắt buộc phải là 1 mảng`,
      })
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    _.merge(req.media, validate.value);
    await req.media.save();
    res.locals.update = req.media;
    return next();
  } catch (e) {
    return next(e);
  }
};
