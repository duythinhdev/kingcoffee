const Joi = require('@hapi/joi');
const nconf = require('nconf');
const url = require('url');

exports.register = async (req, res, next) => {
  const schema = Joi.object().keys({
    type: Joi.string().allow('user').default('user').messages({
      'string.base': `"type" bắt buộc phải là những ký tự`
    }),
    email: Joi.string().email().required().messages({
      'string.base': `"email" bắt buộc phải có dạng 'example@gmail.com'`,
      'string.email': `"email" bắt buộc phải có dạng 'example@gmail.com'`,
      'string.empty': `"email" không được để trống`,
      'any.required': `Yêu cầu phải có "email"`
    }),
    password: Joi.string().min(6).required().messages({
      'string.base': `"password" bắt buộc phải là những ký tự`,
      'string.min': `"password" bắt buộc phải có ít nhất 6 ký tự`,
      'string.empty': `"password" không được để trống`,
      'any.required': `Yêu cầu phải có "password"`
    }),
    phoneNumber: Joi.string().allow('', null).optional().messages({
      'string.base': `"phoneNumber" bắt buộc phải là những ký tự`
    }),
    name: Joi.string().allow('', null).optional().messages({
      'string.base': `"name" bắt buộc phải là những ký tự`
    })
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    const count = await DB.User.countDocuments({
      email: validate.value.email.toLowerCase()
    });
    if (count) {
      return next(PopulateResponse.error({
        message: 'Email này đã có người sử dụng'
      }, 'EMAIL ĐÃ ĐƯỢC SỬ DỤNG'));
    }

    const user = new DB.User(validate.value);
    user.emailVerifiedToken = Helper.String.randomString(48);
    await user.save();

    // now send email verificaiton to user
    await Service.Mailer.send('verify-email.html', user.email, {
      subject: 'Verify email address',
      emailVerifyLink: url.resolve(nconf.get('baseUrl'), `v1/auth/verifyEmail/${user.emailVerifiedToken}`)
    });

    res.locals.register = PopulateResponse.success({
      message: 'Tài khoản của bạn đã được tạo vui lòng xác nhật maiil để hoàn thành bước đăng ký'
    }, 'USE_CREATED');
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.verifyEmail = async (req, res, next) => {
  const schema = Joi.object().keys({
    token: Joi.string().required().messages({
      'string.base': `"token" bắt buộc phải là những ký tự`,
      'string.empty': `"token" không được để trống`,
      'any.required': `Yêu cầu phải có "token"`
    })
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    const user = await DB.User.findOne({
      emailVerifiedToken: req.body.token
    });
    if (!user) {
      return next(PopulateResponse.error({
        message: 'Token xác nhận email không đúng'
      }, 'TOKEN KHÔNG ĐÚNG'));
    }

    user.emailVerified = true;
    user.emailVerifiedToken = null;
    await user.save();

    res.locals.verifyEmail = PopulateResponse.success({
      message: 'Tài khoản email của bạn đã được xác nhận'
    }, 'EMAIL ĐÃ XÁC NHẬN');
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.verifyEmailView = async (req, res, next) => {
  try {
    const user = await DB.User.findOne({
      emailVerifiedToken: req.params.token
    });

    if (user) {
      user.emailVerified = true;
      user.emailVerifiedToken = null;
      await user.save();
    }

    return res.render('auth/verify-email.html', {
      verified: user !== null,
      siteName: nconf.get('SITE_NAME')
    });
  } catch (e) {
    return next(e);
  }
};

exports.forgot = async (req, res, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().email().required()
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    const user = await DB.User.findOne({
      email: validate.value.email
    });
    if (!user) {
      return next(PopulateResponse.error({
        message: 'Email này chưa đăng ký'
      }, 'KHÔNG TÌM THẤY EMAIL NÀY'));
    }

    const passwordResetToken = Helper.String.randomString(48);
    await DB.User.update({
      _id: user._id
    }, {
      $set: { passwordResetToken }
    });

    // now send email verificaiton to user
    await Service.Mailer.send('forgot-password.html', user.email, {
      subject: 'Forgot password',
      passwordResetLink: url.resolve(nconf.get('baseUrl'), `v1/auth/passwordReset/${passwordResetToken}`),
      user: user.toObject()
    });

    res.locals.forgot = PopulateResponse.success({
      message: 'Mật khẩu đã được gửi vào email của bạn'
    }, 'EMAIL CHO QUÊN MẬT KHẨU ĐÃ ĐƯỢC GỬI');
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.resetPasswordView = async (req, res, next) => {
  try {
    const user = await DB.User.findOne({
      passwordResetToken: req.params.token
    });

    if (!user) {
      return res.render('not-found.html');
    }

    if (req.method === 'GET') {
      return res.render('auth/change-password.html', {
        openForm: true
      });
    }

    if (!req.body.password) {
      return res.render('auth/change-password.html', {
        openForm: true,
        error: true,
        siteName: nconf.get('SITE_NAME')
      });
    }

    user.password = req.body.password;
    user.passwordResetToken = null;
    await user.save();

    return res.render('auth/change-password.html', {
      openForm: false,
      error: false,
      siteName: nconf.get('SITE_NAME')
    });
  } catch (e) {
    return next(e);
  }
};
