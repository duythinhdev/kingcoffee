const _ = require('lodash');
const Joi = require('@hapi/joi');
const fs = require('fs');
const path = require('path');
const Image = require('../../media/components/image');
const adminLog = require('../../adminlog');

const validateSchema = Joi.object().keys({
  firstName: Joi.string().required().messages({
    'string.base': `"firstName" bắt buộc phải là những ký tự`,
    'string.empty': `"firstName" không được để trống`,
    'any.required': `Yêu cầu phải có "firstName"`
  }),
  lastName: Joi.string().allow("").optional().messages({
    'string.base': `"id" bắt buộc phải là 1 'lastName'`
  }),
  phoneNumber: Joi.string().required().min(10).max(11).messages({
    'string.base': `"phoneNumber" bắt buộc phải là những ký tự`,
    'string.empty': `"phoneNumber" không được để trống`,
    'any.required': `Yêu cầu phải có "phoneNumber"`
  }),
  city: Joi.object().keys({
    id: Joi.number().required().messages({
      'string.base': `"city{id}" bắt buộc phải là số`,
      'string.empty': `"city{id}" không được để trống`,
      'any.required': `Yêu cầu phải có "city{id}"`
    }),
    name: Joi.string().required().messages({
      'string.base': `"city{name}" bắt buộc phải là những ký tự`,
      'string.empty': `"city{name}" không được để trống`,
      'any.required': `Yêu cầu phải có "city{name}"`
    })
  }),
  ward: Joi.object().keys({
    id: Joi.number().required().messages({
      'string.base': `"ward{id}" bắt buộc phải là số`,
      'string.empty': `"ward{id}" không được để trống`,
      'any.required': `Yêu cầu phải có "ward{id}"`
    }),
    name: Joi.string().required().messages({
      'string.base': `"ward{name}" bắt buộc phải là những ký tự`,
      'string.empty': `"ward{name}" không được để trống`,
      'any.required': `Yêu cầu phải có "ward{name}"`
    })
  }),
  district: Joi.object().keys({
    id: Joi.number().required().messages({
      'string.base': `"district{id}" bắt buộc phải là số`,
      'string.empty': `"district{id}" không được để trống`,
      'any.required': `Yêu cầu phải có "district{id}"`
    }),
    name: Joi.string().required().messages({
      'string.base': `"district{name}" bắt buộc phải là những ký tự`,
      'string.empty': `"district{name}" không được để trống`,
      'any.required': `Yêu cầu phải có "district{name}"`
    })
  }),
  address: Joi.string().required().messages({
    'string.base': `"address" bắt buộc phải là những ký tự`,
    'string.empty': `"address" không được để trống`,
    'any.required': `Yêu cầu phải có "address"`
  }),
  zipCode: Joi.string().allow(null, "").messages({
    'string.base': `"zipCode" bắt buộc phải là những ký tự`,
    'string.empty': `"zipCode" không được để trống`,
    'any.required': `Yêu cầu phải có "zipCode"`
  }),
  default: Joi.bool().default(false).optional().messages({
    'boolean.base': `"default" chỉ có thế là 'true' hoặc 'false'`
  }),
}).unknown();

/**
 * Create a new user
 */
exports.create = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      username: Joi.string().required().messages({
        'string.base': `"username" bắt buộc phải là những ký tự`,
        'string.empty': `"username" không được để trống`,
        'any.required': `Yêu cầu phải có "username"`
      }),
      email: Joi.string().email().allow('').messages({
        'string.base': `"email" bắt buộc phải có dạng 'example@gmail.com'`,
        'string.email': `"email" bắt buộc phải có dạng 'example@gmail.com'`,
        'any.required': `Yêu cầu phải có "email"`
      }),
      password: Joi.string().min(6).required().messages({
        'string.base': `"password" bắt buộc phải là những ký tự`,
        'string.min': `"password" bắt buộc phải có ít nhất 6 ký tự`,
        'string.empty': `"password" không được để trống`,
        'any.required': `Yêu cầu phải có "password"`
      })
    }).unknown();

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const data = req.body;
    // if (data.role !== 'admin') {
    //   data.role = 'user';
    // }

    const user = await Service.User.create(data);
    res.locals.user = user;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * do update for user profile or admin update
 */
exports.update = async (req, res, next) => {
  try {
    const user = req.params.id ? await DB.User.findOne({ _id: req.params.id }) : req.user;
    const oldUser = JSON.parse(JSON.stringify(user))
    let publicFields = [
      'name', 'password', 'address', 'phoneNumber'
    ];
    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      publicFields = publicFields.concat([
        'isActive', 'emailVerified', 'role'
      ]);
    }
    const fields = _.pick(req.body, publicFields);
    console.log()
    _.merge(user, fields);
    await user.save();

    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      if (fields.isActive !== undefined && oldUser.isActive !== fields.isActive) {
        const text = fields.isActive ? `${req.user.username} đã kích hoạt tài khoản` : `${req.user.username} bỏ kích hoạt tài khoản`;
        await Service.AdminLog.create(user.username, text, adminLog.status.Changed);
      }
    }

    res.locals.update = user;
    next();
  } catch (e) {
    next(e);
  }
};

exports.me = (req, res, next) => {
  res.locals.me = req.user;
  next();
};

exports.findUserShippingAddress = async (req, res, next) => {
  try {
    res.locals.shippingAddress = req.user.shippingAddress;
    next();
  } catch (e) {
    next(e);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const user = await DB.User.findOne({
      _id: req.params.id
    });

    res.locals.user = user;
    next();
  } catch (e) {
    next(e);
  }
};


/**
 * update user avatar
 */
exports.updateAvatar = async (req, res, next) => {
  try {
    const user = req.params.id ? await DB.User.findOne({ _id: req.params.id }) : req.user;
    if (!user) {
      return next(PopulateResponse.notFound());
    }

    // create thumb for the avatar
    const thumbPath = await Image.resize({
      input: req.file.path,
      width: process.env.AVATAR_SIZE_WIDTH || 250,
      height: process.env.AVATAR_SIZE_HEIGHT || 250,
      resizeOption: '^'
    });
    const update = {
      avatar: thumbPath
    };

    if (process.env.USE_S3 === 'true') {
      const s3Data = await Service.S3.uploadFile(thumbPath, {
        ACL: 'public-read',
        fileName: `avatars/${Helper.String.getFileName(thumbPath)}`
      });
      update.avatar = s3Data.url;
    }

    await DB.User.update({ _id: req.params.id || req.user._id }, {
      $set: update
    });

    // unlink old avatar
    if (user.avatar && !Helper.String.isUrl(user.avatar) && fs.existsSync(path.resolve(user.avatar))) {
      fs.unlinkSync(path.resolve(user.avatar));
    }
    // remove tmp file
    if (fs.existsSync(path.resolve(req.file.path))) {
      fs.unlinkSync(path.resolve(req.file.path));
    }

    // TODO - remove old avatar in S3?
    if (process.env.USE_S3 === 'true' && fs.existsSync(path.resolve(thumbPath))) {
      fs.unlinkSync(path.resolve(thumbPath));
    }

    res.locals.updateAvatar = {
      url: DB.User.getAvatarUrl(update.avatar)
    };

    return next();
  } catch (e) {
    return next(e);
  }
};


/**
 * update user shipping address
 */
exports.updateShippingAddress = async (req, res, next) => {
  try {
    const validate = validateSchema.keys({
      id: Joi.string().required().messages({
        'string.base': `"id" bắt buộc phải là những ký tự`,
        'string.empty': `"id" không được để trống`,
        'any.required': `Yêu cầu phải có "id"`
      })
    }).validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const user = req.user;
    if (!user) {
      return next(PopulateResponse.notFound());
    }

    let shippingAddress = req.user.shippingAddress;
    const index = shippingAddress.findIndex(a => a.id === req.body.id)
    if (index === -1) {
      return next(PopulateResponse.notFound());
    }

    if (req.body.default) {
      const index = req.user.shippingAddress.findIndex(a => a.default === true)
      if (index !== -1) {
        req.user.shippingAddress[index].default = false
      }
    } else if (req.body.default === false && shippingAddress[index].default === true) {
      return next(PopulateResponse.error(null, "Default is required!"))
    }

    shippingAddress[index]._id = req.body.id;
    shippingAddress[index].firstName = req.body.firstName;
    shippingAddress[index].lastName = req.body.lastName;
    shippingAddress[index].phoneNumber = req.body.phoneNumber;
    shippingAddress[index].address = req.body.address;
    shippingAddress[index].district = req.body.district;
    shippingAddress[index].ward = req.body.ward;
    shippingAddress[index].city = req.body.city;
    shippingAddress[index].zipCode = req.body.zipCode;
    shippingAddress[index].default = req.body.default;

    await DB.User.update({ _id: req.user._id }, {
      $set: {
        shippingAddress
      }
    });


    return next();
  } catch (e) {
    return next(e);
  }
};

exports.search = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['name', 'phoneNumber', 'email', 'username'],
      boolean: ['isActive', 'phoneVerified', 'emailVerified', 'isShop'],
      //equal: ['role']
    });

    // if (req.query.userRoles.find(x => x.RoleName === Enums.UserEnums.HUB.key)) {
    //   //query.role = 'user';
    //   query.isShop = true;
    // }

    // if (req.query.userRoles.find(x => x.RoleName === Enums.UserEnums.WE.key)) {
    //   //query.role = 'user';
    //   query.isShop = false;
    // }

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.User.countDocuments(query);
    const items = await DB.User.find(query)
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
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

exports.searchAll = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()

  try {
    const count = await DB.User.countDocuments({});
    const take = parseInt(req.query.take, 10) || count;
    const items = await DB.User.find({})
      .collation({ locale: 'en' })
      .skip(page * take)
      .limit(take)
      .exec();
    console.log('count ' + count)
    res.locals.searchAll = {
      count,
      items
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const user = DB.User.findOne({ _id: req.params.userId });
    if (!user) {
      return next(PopulateResponse.notFound());
    }

    if (user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      return next(PopulateResponse.forbidden());
    }

    await user.remove();
    res.locals.remove = {
      success: true,
      message: "Xóa Thành Công"
    };
    return next();
  } catch (e) {
    next(e);
  }
};

exports.createShippingAddress = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    if (req.user.shippingAddress.length === 0) {
      req.body.default = true
    } else if (req.body.default) {
      const index = req.user.shippingAddress.findIndex(a => a.default === true)
      if (index !== -1) {
        req.user.shippingAddress[index].default = false
      }
    }

    req.user.shippingAddress.push(req.body)

    await DB.User.update({ _id: req.user._id }, {
      $set: {
        shippingAddress: req.user.shippingAddress
      }
    })

    return next()
  } catch (e) {
    return next(e)
  }
}

exports.removeOneShippingAddress = async (req, res, next) => {
  try {
    const shippingAddressId = req.params.id;
    let shippingAddress = req.user.shippingAddress;


    const index = shippingAddress.findIndex(a => a.id === shippingAddressId)
    if (index === -1) {
      return next(PopulateResponse.notFound());
    }
    else if (shippingAddress[index].default == true) {
      return next(PopulateResponse.deleteUnaccepted());
    }
    else {
      await shippingAddress.splice(index, 1);
      await DB.User.update({ _id: req.user._id }, {
        $set: {
          shippingAddress
        }
      });
    }

    res.locals.shippingAddressremoved = {
      success: PopulateResponse.deleteSuccess()
    };
    return next();
  } catch (error) {
    return next(error)
  }
}

exports.getShippingAddressById = async (req, res, next) => {
  try {
    const shippingAddressId = req.params.id;

    let shippingAddress = req.user.shippingAddress;
    const index = shippingAddress.findIndex(a => a.id === shippingAddressId)
    if (index === -1) {
      return next(PopulateResponse.notFound());
    }

    res.locals.data = shippingAddress[index];
    return next();
  } catch (error) {
    return next(error)
  }
}

exports.getUserSocial = async (req, res, next) => {
  try {
    if (req.user) {
      const userSocial = await Service.User.GetInvestUserId(req.user._id);
      res.locals.social = userSocial;
      return next();
    } else {
      return next(PopulateResponse.forbidden());
    }
  } catch (error) {
    return next(error)
  }
}

exports.updateBankInfo = async (req, res, next) => {
  try {
    const updateBankInfo_ValidateSchema = Joi.object().keys({
      bankId: Joi.number().required().messages({
        'number.base': `"bankId" bắt buộc phải là chữ số`,
        'number.empty': `"bankId" không được để trống`,
        'any.required': `Yêu cầu phải có "bankId"`
      }),
      bankName: Joi.string().required().messages({
        'string.base': `"bankName" bắt buộc phải là ký tự`,
        'string.empty': `"bankName" không được để trống`,
        'any.required': `Yêu cầu phải có "bankName"`
      }),
      bankBranchName: Joi.string().allow("").optional().messages({
        'string.base': `"bankBranchName" bắt buộc phải là ký tự`,
        'string.empty': `"bankBranchName" không được để trống`,
        'any.required': `Yêu cầu phải có "bankBranchName"`
      }),
      bankHolderName: Joi.string().required().messages({
        'string.base': `"bankHolderName" bắt buộc phải là ký tự`,
        'string.empty': `"bankHolderName" không được để trống`,
        'any.required': `Yêu cầu phải có "bankHolderName"`
      }),
      bankNumber: Joi.number().required().messages({
        'number.base': `"bankNumber" bắt buộc phải là chữ số`,
        'number.empty': `"bankNumber" không được để trống`,
        'any.required': `Yêu cầu phải có "bankNumber"`
      })
    });

    const validate = updateBankInfo_ValidateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const getUserSocial = await DB.UserSocial.findOne({ userId: req.user._id }, null, { sort: { createdAt: -1 } });
    if (getUserSocial) {
      const token = getUserSocial.accessToken;

      //call update bank information api from invest
      const updateRes = await Service.User.updateBankInfoFromInvest(_.assign({ token }, validate.value));

      if (updateRes) {
        if (updateRes.statusCode == 401) {
          return res.status(401).send();
        }

        if (updateRes.StatusCode == 200) {
          await Service.User.updateBankInfoIntoSocial(_.assign({ user: req.user }, validate.value));
        }
      }
    } else {
      return next(PopulateResponse.forbidden());
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

exports.addCouponCodes = async (req, res, next) => {
  try {
    const updateCouponCodes_ValidateSchema = Joi.object().keys({
      couponCodes: Joi.array().items(
        Joi.object().keys({
          id: Joi.string().required(),
          code: Joi.string().required()
        })
      )
        .required().messages({
          'array.base': `"couponCodes" bắt buộc phải là 1 mảng`,
        }),
    });
    const validate = updateCouponCodes_ValidateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    const user = req.user;
    let couponCodes = user.couponCodes;
    if (!couponCodes) {
      couponCodes = req.body.couponCodes;
    } else {
      couponCodes = couponCodes.concat(req.body.couponCodes);
      couponCodes = couponCodes.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
    }
    await DB.User.update({ _id: user._id }, {
      $set: {
        couponCodes: couponCodes
      }
    });
    return next(PopulateResponse.success({ couponCodes: couponCodes }, "Thêm mã dự thưởng thành công"));
  } catch (error) {
    return next(error);
  }

  

}

exports.updateEmailPhone = async (req, res, next) => {
  try {
    // Validate inputs
    const validateSchema = Joi.object().keys({
      phone_number: Joi.string().required().messages({
        'string.base': `"phone_number" bắt buộc phải là những ký tự`,
        'string.empty': `"phone_number" không được để trống`,
        'any.required': `Yêu cầu phải có "phone_number"`
      }),
      email: Joi.string().allow(null, "").optional().messages({
        'string.base': `"email" bắt buộc phải là những ký tự`,
      })
    }).validate(req.body);
    if (validateSchema.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    // Check duplicate
    await validateDuplicate(req.body.phone_number, req.body.email);

    // Update MongoDB User
    const user = req.user;
    const requestContent = {
      username: req.body.phone_number,
      phoneNumber: req.body.phone_number
    }
    if (req.body.email) {
      requestContent.email = req.body.email;
    }
    await DB.User.update({ _id: user._id }, {
      $set: requestContent,
    });
    delete requestContent.username;

    // Update Invest API Account
    const userSocial = await Service.User.GetInvestUserId(user._id);
    const currentUserData = await Service.SocialConnect.Invest.getUserMe(userSocial.accessToken);
    const investReq = {
      UserId: currentUserData.UserId,
      Phone: requestContent.phoneNumber,
      Email: requestContent.email ? requestContent.email : user.email
    }
    const result = await Service.User.updatePhoneEmailToInvest(investReq, userSocial.accessToken);

    // Return result
    return next(PopulateResponse.success({result: result}, "Cập nhật số điện thoại và email thành công"));
  }
  catch (error) {
    return next(PopulateResponse.error(error.message, 'Cập nhật số điện thoại và email không thành công'));
  }
}

async function validateDuplicate(phone_number, email) {
  const phone_exists = await phoneExists(phone_number);
  if (phone_exists) {
    console.log('Số điện thoại đã tồn tại');
    throw new Error('Số điện thoại đã tồn tại');
  }
  if (email) {
    const email_exists = await emailExists(email)
    if (email_exists) {
      console.log('Địa chỉ email đã tồn tại');
      throw new Error('Địa chỉ email đã tồn tại');
    }
  }
}

async function phoneExists(phone_number) {
  const user_phoneNumber = await DB.User.findOne({ phoneNumber: phone_number });
  if (user_phoneNumber) {
    return true;
  }
  const user_username = await DB.User.findOne({ username: phone_number });
  return user_username ? true : false;
}

async function emailExists(email) {
  const user_email = await DB.User.findOne({ email: email });
  console.log('user: ', user_email);
  return user_email ? true : false;
}