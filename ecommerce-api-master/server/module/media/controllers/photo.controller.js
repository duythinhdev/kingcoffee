const Joi = require('@hapi/joi');
const Image = require('../components/image');

exports.base64Upload = async (req, res, next) => {
  try {
    if (!req.body.base64) {
      return next();
    }

    const data = await Image.saveBase64Image(req.body.base64, req.body);
    req.base64Photo = data;
    return next();
  } catch (e) {
    throw e;
  }
};

/**
 * do upload a photo
 */
exports.upload = async (req, res, next) => {
  try {
    if (!req.file && !req.base64Photo) {
      return next(PopulateResponse.error({
        message: 'Chưa có file ảnh!'
      }, 'CHƯA CÓ FILE ẢNH'));
    }

    const file = req.file || req.base64Photo;
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

    const photo = await Service.Media.createPhoto({
      value: validate.value,
      user: req.user,
      file
    });

    res.locals.photo = photo;
    return next();
  } catch (e) {
    return next(e);
  }
};
