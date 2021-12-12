const Joi = require('@hapi/joi');

exports.check = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      phoneNumber: Joi.string().required().messages({
        'string.base': `"phoneNumber" bắt buộc phải là 1 những ký tự`,
        'string.empty': `"phoneNumber" không được để trống`,
        'any.required': `Yêu cầu phải có "phoneNumber"`
      }),
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    let phoneCheck = await DB.PhoneCheck.findOne({
      phoneNumber: validate.value.phoneNumber,
      userId: req.user ? req.user._id : null
    });
    const code = Helper.String.randomString(5).toUpperCase();
    if (!phoneCheck) {
      phoneCheck = new DB.PhoneCheck({
        phoneNumber: validate.value.phoneNumber,
        userId: req.user ? req.user._id : null,
        code
      });
    }

    await phoneCheck.save();
    Service.Sms.send({
      text: `Mã xác thực của bạn là: ${phoneCheck.code}`,
      to: phoneCheck.phoneNumber
    });
    // TODO - remove in prod env
    res.locals.check = phoneCheck;
    return next();
  } catch (e) {
    return next(e);
  }
};
