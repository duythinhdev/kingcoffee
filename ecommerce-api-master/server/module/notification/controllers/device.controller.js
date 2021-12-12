const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  os: Joi.string().valid('ios', 'android').required().messages({
    'string.base': `"os" bắt buộc phải là những ký tự`,
    'any.only': `"os" bắt buộc phải là 'ios' hoặc 'android'`,
    'string.empty': `"os" không được để trống`,
    'any.required': `Yêu cầu phải có "os"`
  }),
  tokenDevice: Joi.string().required().messages({
    'string.base': `"tokenDevice" bắt buộc phải là những ký tự`,
    'string.empty': `"tokenDevice" không được để trống`,
    'any.required': `Yêu cầu phải có "tokenDevice"`
  })
});

/**
 * Add new mobile device
 */
exports.add = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    await DB.Device.remove({
      userId: req.user._id,
      os: validate.value.os,
      tokenDevice: validate.value.tokenDevice
    });

    const device = new DB.Device(Object.assign(validate.value, {
      userId: req.user._id
    }));
    await device.save();
    res.locals.device = device;
    return next();
  } catch (e) {
    return next(e);
  }
};
