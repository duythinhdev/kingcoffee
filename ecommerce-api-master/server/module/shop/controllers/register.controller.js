const Joi = require("@hapi/joi");
const nconf = require("nconf");
const url = require("url");

/**
 * register for shop
 */
exports.register = async (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().required().messages({
      'string.base': `"name" bắt buộc phải là những ký tự`,
      'string.empty': `"name" không được để trống`,
      'any.required': `Yêu cầu phải có "name"`
    }),
    username: Joi.string().required().messages({
      'string.base': `"username" bắt buộc phải là những ký tự`,
      'string.empty': `"username" không được để trống`,
      'any.required': `Yêu cầu phải có "username"`
    }), // email of shop, or useremail
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.base': `"email" bắt buộc phải là những ký tự`,
        'string.empty': `"email" không được để trống`
      }),
    phoneNumber: Joi.string().required().messages({
      'string.base': `"phoneNumber" bắt buộc phải là những ký tự`,
      'string.empty': `"phoneNumber" không được để trống`,
      'any.required': `Yêu cầu phải có "phoneNumber"`
    }),
    address: Joi.string().required().messages({
      'string.base': `"address" bắt buộc phải là những ký tự`,
      'string.empty': `"address" không được để trống`,
      'any.required': `Yêu cầu phải có "address"`
    }),
    city: Joi.string().required().messages({
      'string.base': `"city" bắt buộc phải là những ký tự`,
      'string.empty': `"city" không được để trống`,
      'any.required': `Yêu cầu phải có "city"`
    }),
    district: Joi.string().required().messages({
      'string.base': `"district" bắt buộc phải là những ký tự`,
      'string.empty': `"district" không được để trống`,
      'any.required': `Yêu cầu phải có "district"`
    }),
    ward: Joi.string().required().messages({
      'string.base': `"ward" bắt buộc phải là những ký tự`,
      'string.empty': `"ward" không được để trống`,
      'any.required': `Yêu cầu phải có "ward"`
    }),
    zipCode: Joi.number()
      .allow("", null)
      .optional()
      .messages({
        'number.base': `"zipCode" bắt buộc phải là 1 số`
      }),
    verificationIssueId: Joi.string().required().messages({
      'string.base': `"verificationIssueId" bắt buộc phải là những ký tự`,
      'string.empty': `"verificationIssueId" không được để trống`,
      'any.required': `Yêu cầu phải có "verificationIssueId"`
    }),
  });

  const validate = schema.validate(req.body);
  if (validate.error) {
    return next(PopulateResponse.validationError(validate.error));
  }

  try {
    // let user = req.user;
    // if (user && user.isShop) {
    //   return next(PopulateResponse.error({
    //     message: 'Your account has already registered with a shop. please try to login'
    //   }, 'ERR_ACCOUNT_HAVE_SHOP'));
    // } else if (!user) {
    //   const count = await DB.User.countDocuments({
    //     username: validate.value.username.toLowerCase()
    //   });
    //   if (count) {
    //     return next(PopulateResponse.error({
    //       message: 'This username has already taken'
    //     }, 'ERR_USERNAME_ALREADY_TAKEN'));
    //   }

    //   user = new DB.User(validate.value);
    //   await user.save();

    // }
    const user = await DB.User.findOne({
      username: validate.value.username.toLowerCase()
    });
    if (!user) {
      return next(
        PopulateResponse.error(
          {
            message: "username không tồn tại"
          },
          "TÀI KHOẢN KHÔNG TỒN TẠI"
        )
      );
    }

    if (user && user.isShop) {
      return next(
        PopulateResponse.error(
          {
            message:
              "Tài khoản của bạn đã có đăng ký cửa hàng. Xin hãy đăng nhập"
          },
          "TÀI KHOẢN ĐÃ CÓ CỬA HÀNG"
        )
      );
    }

    const existShop = await DB.Shop.findOne({ _id: user.shopId });
    if (existShop) {
      return next(
        PopulateResponse.error(
          {
            message: "Tài khoản của bạn đã có đăng ký cửa hàng, nhưng chưa được kích hoạt"
          },
          "TÀI KHOẢN ĐÃ CÓ CỬA HÀNG"
        )
      );
    }

    const shop = new DB.Shop({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      city: req.body.city,
      district: req.body.district,
      ward: req.body.ward,
      zipCode: req.body.zipCode,
      verificationIssueId: req.body.verificationIssueId,
      shippingSettings: {
        city: req.body.city,
        district: req.body.district,
        ward: req.body.ward,
        address: req.body.address,
        zipCode: req.body.zipCode
      }
    });
    shop.location = await Service.Shop.getLocation(validate.value);
    shop.ownerId = user._id;
    await shop.save();
    await DB.User.update(
      { _id: user._id },
      {
        $set: {
          isShop: true,
          shopId: shop._id
        }
      }
    );

    // send alert email to admin
    if (process.env.EMAIL_NOTIFICATION_NEW_SHOP) {
      await Service.Mailer.send(
        "shop/new-shop-register.html",
        process.env.EMAIL_NOTIFICATION_NEW_SHOP,
        {
          subject: "Có cửa hàng mới vừa đăng ký",
          shop: shop.toObject(),
          user,
          shopUpdateUrl: url.resolve(
            process.env.adminWebUrl,
            `shops/update/${shop._id}`
          )
        }
      );
    }

    res.locals.register = shop;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      // TODO - verify about file size, and type
      return next(
        PopulateResponse.error(
          {
            message: "Xin vui lòng tải file lên"
          },
          "CHƯA CÓ FILE"
        )
      );
    }

    const file = new DB.Media({
      type: "file",
      systemType: "verification_issue",
      name: req.file.filename,
      mimeType: req.file.mimetype,
      originalPath: req.file.path,
      filePath: req.file.path,
      convertStatus: "done"
    });
    await file.save();

    res.locals.document = {
      _id: file._id,
      name: req.file.filename
    };
    return next();
  } catch (e) {
    return next(e);
  }
};
