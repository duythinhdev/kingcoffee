const Joi = require('@hapi/joi');

/**
 * change phone number of this user
 */
exports.changePhone = async (req, res, next) => {
  const schema = Joi.object().keys({
    phoneNumber: Joi.string().required()
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    const count = await DB.User.countDocuments({
      phoneNumber: req.body.phoneNumber,
      _id: {
        $ne: req.user._id
      },
      isActive: true
    });
    if (count) {
      return next(PopulateResponse.error({
        message: 'Số điện thoại này đã được sử dụng'
      }, 'SỐ ĐIỆN THOẠI ĐÃ TỒN TẠI'));
    }

    const code = Helper.String.randomString(5);
    let phoneVerify = await DB.PhoneVerify.findOne({
      phoneNumber: req.body.phoneNumber
    });
    if (!phoneVerify) {
      phoneVerify = new DB.PhoneVerify({
        userId: req.user._id,
        phoneNumber: req.body.phoneNumber
      });
    }
    phoneVerify.code = code;
    await phoneVerify.save();
    // TODO - send phone verify code to user

    res.locals.changePhone = PopulateResponse.createSuccess({
      message: 'Mã xác nhận đã được gửi đến số điện thoại của bạn',
      code // TODO - remove in prod
    });
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * verify user phone number
 */
exports.verifyPhone = async (req, res, next) => {
  const schema = Joi.object().keys({
    phoneNumber: Joi.string().required().messages({
      'string.base': `"phoneNumber" bắt buộc phải là những ký tự`,
      'string.empty': `"phoneNumber" không được để trống`,
      'any.required': `Yêu cầu phải có "phoneNumber"`
    }),
    code: Joi.string.require().messages({
      'string.base': `"code" bắt buộc phải là những ký tự`,
      'string.empty': `"code" không được để trống`,
      'any.required': `Yêu cầu phải có "code"`
    })
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    const phoneVerify = await DB.PhoneVerify.findOne({
      code: req.body.code,
      phoneNumber: req.body.phoneNumber
    });
    if (!phoneVerify) {
      return next(PopulateResponse.notFound({
        message: 'Không tìm thấy số điện thoại này!'
      }));
    }

    await DB.User.update({
      _id: phoneVerify.userId
    }, {
      $set: {
        phoneNumber: phoneVerify.phoneNumber,
        phoneVerified: true
      }
    });
    await phoneVerify.remove();
    res.locals.verifyPhone = PopulateResponse.updateSuccess({
      message: 'Số điện thoại của bạn đã được xác thực',
      success: true
    });

    return next();
  } catch (e) {
    return next(e);
  }
};
