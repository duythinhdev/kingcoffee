const Joi = require('@hapi/joi');

/**
 * do upload a photo
 */
exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(PopulateResponse.error({
        message: 'Chưa có file video!'
      }, 'Chưa có file video'));
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

    const video = await Service.Media.createVideo({
      value: validate.value,
      user: req.user,
      file: req.file
    });

    res.locals.video = video;
    return next();
  } catch (e) {
    return next(e);
  }
};
