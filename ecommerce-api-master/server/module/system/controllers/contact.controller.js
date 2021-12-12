const Joi = require('@hapi/joi');

exports.send = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      name: Joi.string().required().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
        'string.empty': `"name" không được để trống`,
        'any.required': `Yêu cầu phải có "name"`
      }),
      email: Joi.string().email().required().messages({
        'string.base': `"email" bắt buộc phải có dạng 'example@gmail.com'`,
        'string.email': `"email" bắt buộc phải có dạng 'example@gmail.com'`,
        'string.empty': `"email" không được để trống`,
        'any.required': `Yêu cầu phải có "email"`
      }),
      message: Joi.string().required().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
        'string.empty': `"name" không được để trống`,
        'any.required': `Yêu cầu phải có "name"`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    await Service.Mailer.send('contact/message.html', process.env.ADMIN_EMAIL, Object.assign(validate.value, {
      subject: `New contact from ${validate.value.name}`
    }));

    res.locals.send = { success: true, message: "Đã Gửi Thành Công" };
    return next();
  } catch (e) {
    return next();
  }
};
