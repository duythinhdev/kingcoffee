const Joi = require('@hapi/joi');

exports.sendEmail = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      subject: Joi.string().required().messages({
        'string.base': `"subject" bắt buộc phải là những ký tự`,
        'string.empty': `"subject" không được để trống`,
        'any.required': `Yêu cầu phải có "subject"`
      }),
      content: Joi.string().allow(null, '').optional().messages({
        'string.base': `"content" bắt buộc phải là những ký tự`,
      }),
      userType: Joi.string().allow(null, '').optional().messages({
        'string.base': `"userType" bắt buộc phải là những ký tự`,
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    await Service.Newsletter.sendMail(validate.value);
    res.locals.sendEmail = { success: true, message: "Gửi Mail Thành Công"  };
    return next();
  } catch (e) {
    return next(e);
  }
};
