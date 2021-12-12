const Joi = require('@hapi/joi');
const _ = require('lodash');
const adminLog = require('../../adminlog');

exports.getUserShop = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isShop || !req.user.shopId) {
      return next(PopulateResponse.error({
        message: 'Tài khoản của bạn chưa đăng ký cửa hàng. Xin vui lòng đăng ký'
      }, 'TÀI KHOẢN CHƯA CÓ CỬA HÀNG'));
    }

    const shop = await DB.Shop.findOne({ _id: req.user.shopId })
      .populate('owner')
      .populate('logo')
      .populate('banner')
      .populate('verificationIssue');

    const data = shop.toObject();
    data.logo = shop.logo;
    data.banner = shop.banner;
    data.verificationIssue = shop.verificationIssue;
    data.owner = shop.owner ? shop.owner.getPublicProfile() : null;

    res.locals.shop = data; // owner can see all information
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.details = async (req, res, next) => {
  try {
    const condition = {};
    if (Helper.App.isObjectId(req.params.shopId)) {
      condition._id = req.params.shopId;
    } else {
      condition.alias = req.params.shopId;
    }

    const query = DB.Shop.findOne(condition)
      .populate('owner')
      .populate('logo')
      .populate('banner');
    const isAdmin = req.user && req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value);
    if (isAdmin) {
      query.populate('verificationIssue');
    }
    const shop = await query.exec();

    const data = shop.toObject();
    data.owner = shop.owner ? shop.owner.getPublicProfile() : null;
    data.logo = shop.logo;
    data.banner = shop.banner;
    data.verificationIssue = shop.verificationIssue;
    data.fullAddress = `${data.address}, ${data.ward}, ${data.district}, ${data.city}`;

    if (!shop) {
      return next(PopulateResponse.notFound());
    }

    res.locals.shop = data;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.search = async (req, res, next) => {
  // TODO - define me
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const isAdmin = req.user && req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value);
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['name', 'address', 'city', 'state', 'zipCode', 'returnAddress', 'email', 'username'],
      boolean: isAdmin ? ['verified', 'activated', 'featured'] : ['featured'],
      equal: ['ownerId']
    });

    // TODO - define platform (admin or seller or user) here
    let defaultSort = true;
    if (!isAdmin) {
      query.verified = true;
      query.activated = true;
      defaultSort = false;
    }

    if (req.query.q) {
      query.name = { $regex: req.query.q.trim(), $options: 'i' };
    }
    const sort = Object.assign(defaultSort ? {} : { featured: -1 }, Helper.App.populateDBSort(req.query));
    const lat = parseFloat(req.query.latitude);
    const lng = parseFloat(req.query.longitude);
    // The latitude must be a number between -90 and 90 and the longitude between -180 and 180.
    if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const distance = parseFloat(req.query.distance);
      query.location = {
        $nearSphere: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)]
      };
      if (distance) {
        // in km
        // https://stackoverflow.com/questions/12180290/convert-kilometers-to-radians
        query.location.$maxDistance = distance / 6371;
      }
    }

    if (req.query.sort === 'random') {
      const randomData = await DB.Shop.aggregate([
        { $match: query },
        { $sample: { size: take } },
        { $project: { _id: 1 } }
      ]);
      if (randomData && randomData.length) {
        query._id = {
          $in: randomData.map(p => p._id)
        };
      }
    }

    const queryItems = DB.Shop.find(query)
      .collation({ locale: 'en' })
      .populate('owner')
      .populate('logo')
      .populate('banner');
    if (isAdmin) {
      queryItems.populate('verificationIssue');
    }
    const count = await DB.Shop.countDocuments(query);
    let items;

    // check searchAll flag
    if (req.query.searchAll && req.query.searchAll === 'true') {
      items = await (query.location ? queryItems : queryItems.sort(sort))
        .exec();
    } else {
      items = await (query.location ? queryItems : queryItems.sort(sort))
        .skip(page * take)
        .limit(take)
        .exec();
    }


    res.locals.search = {
      count,
      items: items.map((item) => {
        const data = item.toObject();
        data.logo = item.logo;
        data.banner = item.banner;
        data.verificationIssue = item.verificationIssue;
        data.owner = item.owner ? item.owner.getPublicProfile() : null;
        data.fullAddress = `${data.address}, ${data.ward}, ${data.district}, ${data.city}`;
        return data;
      })
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      ownerId: Joi.string().required().messages({
        'string.base': '"ownerId" bắt buộc phải là những ký tự',
        'string.empty': '"ownerId" không được để trống',
        'any.required': 'Yêu cầu phải có "ownerId"'
      }),
      name: Joi.string().allow(null, '').required().messages({
        'string.base': '"name" bắt buộc phải là những ký tự'
      }),
      alias: Joi.string().allow(null, '').optional().messages({
        'string.base': '"alias" bắt buộc phải là những ký tự'
      }),
      // username: Joi.string().required(),
      email: Joi.string().email().optional().messages({
        'string.base': '"email" bắt buộc phải là những ký tự',
        'string.empty': '"email" không được để trống',
      }),
      phoneNumber: Joi.string().allow(null, '').optional().messages({
        'string.base': '"phoneNumber" bắt buộc phải là những ký tự',
        'string.empty': '"phoneNumber" không được để trống'
      }),
      address: Joi.string().required().messages({
        'string.base': '"address" bắt buộc phải là những ký tự',
        'string.empty': '"address" không được để trống',
        'any.required': 'Yêu cầu phải có "address"'
      }),
      city: Joi.string().allow(null, '').optional().messages({
        'string.base': '"city" bắt buộc phải là những ký tự',
        'string.empty': '"city" không được để trống'
      }),
      district: Joi.string().allow(null, '').optional().messages({
        'string.base': '"district" bắt buộc phải là những ký tự',
        'string.empty': '"district" không được để trống'
      }),
      ward: Joi.string().allow(null, '').optional().messages({
        'string.base': '"ward" bắt buộc phải là những ký tự',
        'string.empty': '"ward" không được để trống'
      }),
      zipCode: Joi.string().allow(null, '').optional().messages({
        'string.base': '"zipCode" bắt buộc phải là những ký tự',
        'string.empty': '"zipCode" không được để trống'
      }),
      returnAddress: Joi.string().allow(null, '').optional().messages({
        'string.base': '"returnAddress" bắt buộc phải là những ký tự'
      }),
      location: Joi.object().keys({
        lat: Joi.number().allow(null, '').optional().default(0),
        long: Joi.string().allow(null, '').optional().default(0)
      }),
      verificationIssueId: Joi.string().allow(null, '').optional().messages({
        'string.base': '"verificationIssueId" bắt buộc phải là những ký tự'
      }),
      businessInfo: Joi.object().keys({
        name: Joi.string().allow(null, '').optional().messages({
          'string.base': '"name" bắt buộc phải là những ký tự'
        }),
        identifier: Joi.string().allow(null, '').optional().messages({
          'string.base': '"identifier" bắt buộc phải là những ký tự'
        }),
        address: Joi.string().allow(null, '').optional().messages({
          'string.base': '"identifier" bắt buộc phải là những ký tự'
        })
      }).optional().messages({
        'object.base': '"businessInfo" bắt buộc phải là 1 object',
        'object.empty': '"businessInfo" không được để trống'
      }),
      bankInfo: Joi.object().keys({
        bankName: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankName" bắt buộc phải là những ký tự'
        }),
        swiftCode: Joi.string().allow(null, '').optional().messages({
          'string.base': '"swiftCode" bắt buộc phải là những ký tự'
        }),
        bankId: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankId" bắt buộc phải là những ký tự'
        }),
        bankBranchId: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankBranchId" bắt buộc phải là những ký tự'
        }),
        bankBranchName: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankBranchName" bắt buộc phải là những ký tự'
        }),
        accountNumber: Joi.string().allow(null, '').optional().messages({
          'string.base': '"accountNumber" bắt buộc phải là những ký tự'
        }),
        accountName: Joi.string().allow(null, '').optional().messages({
          'string.base': '"accountName" bắt buộc phải là những ký tự'
        })
      }).optional().messages({
        'object.base': '"bankInfo" bắt buộc phải là 1 object',
        'object.empty': '"bankInfo" không được để trống'
      }),
      socials: Joi.object().keys({
        facebook: Joi.string().allow(null, '').optional().messages({
          'string.base': '"facebook" bắt buộc phải là những ký tự'
        }),
        twitter: Joi.string().allow(null, '').optional().messages({
          'string.base': '"twitter" bắt buộc phải là những ký tự'
        }),
        google: Joi.string().allow(null, '').optional().messages({
          'string.base': '"google" bắt buộc phải là những ký tự'
        }),
        linkedin: Joi.string().allow(null, '').optional().messages({
          'string.base': '"linkedin" bắt buộc phải là những ký tự'
        }),
        youtube: Joi.string().allow(null, '').optional().messages({
          'string.base': '"youtube" bắt buộc phải là những ký tự'
        }),
        instagram: Joi.string().allow(null, '').optional().messages({
          'string.base': '"instagram" bắt buộc phải là những ký tự'
        }),
        flickr: Joi.string().allow(null, '').optional().messages({
          'string.base': '"flickr" bắt buộc phải là những ký tự'
        })
      }).optional().messages({
        'object.base': '"socials" bắt buộc phải là 1 object',
        'object.empty': '"socials" không được để trống'
      }),
      socialConnected: Joi.object().keys({
        facebook: Joi.boolean().optional().messages({
          'boolean.base': '"facebook" chỉ có thế là \'true\' hoặc \'false\''
        }),
        twitter: Joi.boolean().optional().messages({
          'boolean.base': '"twitter" chỉ có thế là \'true\' hoặc \'false\''
        }),
        google: Joi.boolean().optional().messages({
          'boolean.base': '"google" chỉ có thế là \'true\' hoặc \'false\''
        }),
        linkedin: Joi.boolean().optional().messages({
          'boolean.base': '"linkedin" chỉ có thế là \'true\' hoặc \'false\''
        })
      }).optional().messages({
        'object.base': '"socialConnected" bắt buộc phải là 1 object',
        'object.empty': '"socialConnected" không được để trống'
      }),
      logoId: Joi.string().allow(null, '').optional().messages({
        'string.base': '"logoId" bắt buộc phải là những ký tự'
      }),
      bannerId: Joi.string().allow(null, '').optional().messages({
        'string.base': '"bannerId" bắt buộc phải là những ký tự'
      }),
      verified: Joi.boolean().optional().default(true).messages({
        'boolean.base': '"verified" chỉ có thế là \'true\' hoặc \'false\''
      }), // valid with admin only
      activated: Joi.boolean().optional().messages({
        'boolean.base': '"activated" chỉ có thế là \'true\' hoặc \'false\'',
        'boolean.empty': '"activated" không được để trống'
      }), // valid with admin only
      featured: Joi.boolean().optional().messages({
        'boolean.base': '"featured" chỉ có thế là \'true\' hoặc \'false\'',
        'boolean.empty': '"featured" không được để trống'
      }), // valid with admin only
      featuredTo: Joi.string().optional().messages({
        'string.base': '"featuredTo" bắt buộc phải là những ký tự',
        'string.empty': '"featuredTo" không được để trống'
      }), // valid with admin only
      gaCode: Joi.string().allow(null, '').optional().messages({
        'string.base': '"gaCode" bắt buộc phải là những ký tự'
      }),
      headerText: Joi.string().allow(null, '').optional().messages({
        'string.base': '"headerText" bắt buộc phải là những ký tự'
      }),
      notifications: Joi.object().keys({
        lowInventory: Joi.boolean().optional().messages({
          'boolean.base': '"featured" chỉ có thế là \'true\' hoặc \'false\'',
          'boolean.empty': '"headerText" không được để trống'
        })
      }).optional().messages({
        'object.base': '"notifications" bắt buộc phải là 1 object',
        'object.empty': '"notifications" không được để trống'
      }),
      storeWideShipping: Joi.boolean().optional().messages({
        'boolean.base': '"storeWideShipping" chỉ có thế là \'true\' hoặc \'false\'',
        'boolean.empty': '"storeWideShipping" không được để trống'
      }),
      shippingSettings: Joi.object().keys({
        city: Joi.string().required().messages({
          'string.base': '"city" bắt buộc phải là những ký tự',
          'string.empty': '"city" không được để trống',
          'any.required': 'Yêu cầu phải có "city"'
        }),
        district: Joi.string().required().messages({
          'string.base': '"district" bắt buộc phải là những ký tự',
          'string.empty': '"district" không được để trống',
          'any.required': 'Yêu cầu phải có "district"'
        }),
        ward: Joi.string().required().messages({
          'string.base': '"ward" bắt buộc phải là những ký tự',
          'string.empty': '"ward" không được để trống',
          'any.required': 'Yêu cầu phải có "ward"'
        }),
        address: Joi.string().required().messages({
          'string.base': '"address" bắt buộc phải là những ký tự',
          'string.empty': '"address" không được để trống',
          'any.required': 'Yêu cầu phải có "address"'
        }),
        zipCode: Joi.string().required().messages({
          'string.base': '"zipCode" bắt buộc phải là những ký tự',
          'string.empty': '"zipCode" không được để trống',
          'any.required': 'Yêu cầu phải có "zipCode"'
        }),
      }).optional().optional()
        .messages({
          'object.base': '"shippingSettings" bắt buộc phải là 1 object',
          'object.empty': '"shippingSettings" không được để trống'
        }),
      announcement: Joi.string().allow(null, '').optional().messages({
        'string.base': '"announcement" bắt buộc phải là những ký tự'
      }),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const user = await DB.User.findOne({ _id: validate.value.ownerId });
    if (!user) {
      return next(PopulateResponse.error({
        message: 'Người dùng không tồn tại'
      }));
    }
    if (user.isShop) {
      return next(PopulateResponse.error({
        message: 'Tài khoản của bạn đã có đăng ký cửa hàng. Xin hãy đăng nhập'
      }, 'Tài khoản này đã có cửa hàng'));
    }

    validate.value.username = user.username;
    // thiết lập địa chỉ vận chuyển mặc định
    validate.value.shippingSettings = {
      city: validate.value.city,
      ward: validate.value.ward,
      district: validate.value.district,
      address: validate.value.address,
      zipCode: validate.value.zipCode
    };

    validate.value.verified = true;
    validate.value.activated = true;
    const shop = new DB.Shop(validate.value);
    shop.location = await Service.Shop.getLocation(shop);
    await shop.save();
    await DB.User.update({ _id: user._id }, {
      $set: {
        isShop: true,
        shopId: shop._id
      }
    });

    await Service.AdminLog.create(user.username, `${req.user.username} đã tạo cửa hàng ${req.body.name}`, adminLog.status.Added);
    await Service.AdminLog.create(user.username, `${req.user.username} đã kích hoạt cửa hàng ${req.body.name}`, adminLog.status.Changed);
    await Service.AdminLog.create(user.username, `${req.user.username} đã xác nhận cửa hàng ${req.body.name}`, adminLog.status.Changed);

    await Service.Shop.sendEmailApprove(shop);

    // const userSocial = await Service.User.GetGoldtimeUserId(shop.ownerId);
    // if (userSocial) {
    //   await Service.Vendor.VerifyVendor({
    //     userId: userSocial.socialId,
    //     isVendor: validate.value.verified,
    //     NameVendor: validate.value.name,
    //     Address: validate.value.address,
    //     Phone: validate.value.phoneNumber,
    //     Email: validate.value.email
    //   });
    // }

    res.locals.create = shop;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      name: Joi.string().allow(null, '').optional().messages({
        'string.base': '"name" bắt buộc phải là những ký tự'
      }),
      alias: Joi.string().allow(null, '').optional().messages({
        'string.base': '"alias" bắt buộc phải là những ký tự'
      }),
      email: Joi.string().email().optional().messages({
        'string.base': '"email" bắt buộc phải là những ký tự',
        'string.empty': '"email" không được để trống'
      }),
      phoneNumber: Joi.string().allow(null, '').optional().messages({
        'string.base': '"phoneNumber" bắt buộc phải là những ký tự'
      }),
      address: Joi.string().allow(null, '').optional().messages({
        'string.base': '"address" bắt buộc phải là những ký tự'
      }),
      city: Joi.string().allow(null, '').optional().messages({
        'string.base': '"city" bắt buộc phải là những ký tự'
      }),
      district: Joi.string().allow(null, '').optional().messages({
        'string.base': '"district" bắt buộc phải là những ký tự'
      }),
      ward: Joi.string().allow(null, '').optional().messages({
        'string.base': '"ward" bắt buộc phải là những ký tự'
      }),
      zipCode: Joi.string().allow(null, '').optional().messages({
        'string.base': '"zipCode" bắt buộc phải là những ký tự'
      }),
      returnAddress: Joi.string().allow(null, '').optional().messages({
        'string.base': '"returnAddress" bắt buộc phải là những ký tự'
      }),
      location: Joi.object().keys({
        lat: Joi.number().allow(null, '').optional().default(0),
        long: Joi.string().allow(null, '').optional().default(0)
      }),
      verificationIssueId: Joi.string().allow(null, '').optional().messages({
        'string.base': '"verificationIssueId" bắt buộc phải là những ký tự'
      }),
      businessInfo: Joi.object().keys({
        name: Joi.string().allow(null, '').optional().messages({
          'string.base': '"name" bắt buộc phải là những ký tự'
        }),
        identifier: Joi.string().allow(null, '').optional().messages({
          'string.base': '"identifier" bắt buộc phải là những ký tự'
        }),
        address: Joi.string().allow(null, '').optional().messages({
          'string.base': '"address" bắt buộc phải là những ký tự'
        })
      }).optional().messages({
        'object.base': '"businessInfo" bắt buộc phải là 1 object',
        'object.empty': '"businessInfo" không được để trống'
      }),
      bankInfo: Joi.object().keys({
        bankName: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankName" bắt buộc phải là những ký tự'
        }),
        swiftCode: Joi.string().allow(null, '').optional().messages({
          'string.base': '"swiftCode" bắt buộc phải là những ký tự'
        }),
        bankId: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankId" bắt buộc phải là những ký tự'
        }),
        bankBranchId: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankBranchId" bắt buộc phải là những ký tự'
        }),
        bankBranchName: Joi.string().allow(null, '').optional().messages({
          'string.base': '"bankBranchName" bắt buộc phải là những ký tự'
        }),
        accountNumber: Joi.string().allow(null, '').optional().messages({
          'string.base': '"accountNumber" bắt buộc phải là những ký tự'
        }),
        accountName: Joi.string().allow(null, '').optional().messages({
          'string.base': '"accountName" bắt buộc phải là những ký tự'
        }),
      }).optional().messages({
        'object.base': '"bankInfo" bắt buộc phải là 1 object',
        'object.empty': '"bankInfo" không được để trống'
      }),
      socials: Joi.object().keys({
        facebook: Joi.string().allow(null, '').optional().messages({
          'string.base': '"facebook" bắt buộc phải là những ký tự'
        }),
        twitter: Joi.string().allow(null, '').optional().messages({
          'string.base': '"twitter" bắt buộc phải là những ký tự'
        }),
        google: Joi.string().allow(null, '').optional().messages({
          'string.base': '"google" bắt buộc phải là những ký tự'
        }),
        linkedin: Joi.string().allow(null, '').optional().messages({
          'string.base': '"linkedin" bắt buộc phải là những ký tự'
        }),
        youtube: Joi.string().allow(null, '').optional().messages({
          'string.base': '"youtube" bắt buộc phải là những ký tự'
        }),
        instagram: Joi.string().allow(null, '').optional().messages({
          'string.base': '"instagram" bắt buộc phải là những ký tự'
        }),
        flickr: Joi.string().allow(null, '').optional().messages({
          'string.base': '"flickr" bắt buộc phải là những ký tự'
        })
      }).optional().messages({
        'object.base': '"socials" bắt buộc phải là 1 object',
        'object.empty': '"socials" không được để trống'
      }),
      socialConnected: Joi.object().keys({
        facebook: Joi.boolean().optional().messages({
          'string.base': '"facebook" bắt buộc phải là những ký tự',
          'string.empty': '"facebook" không được để trống'
        }),
        twitter: Joi.boolean().optional().messages({
          'string.base': '"twitter" bắt buộc phải là những ký tự',
          'string.empty': '"twitter" không được để trống'
        }),
        google: Joi.boolean().optional().messages({
          'string.base': '"google" bắt buộc phải là những ký tự',
          'string.empty': '"google" không được để trống'
        }),
        linkedin: Joi.boolean().optional().messages({
          'string.base': '"linkedin" bắt buộc phải là những ký tự',
          'string.empty': '"linkedin" không được để trống'
        })
      }).optional().messages({
        'object.base': '"socialConnected" bắt buộc phải là 1 object',
        'object.empty': '"socialConnected" không được để trống'
      }),
      logoId: Joi.string().allow(null, '').optional().messages({
        'string.base': '"logoId" bắt buộc phải là những ký tự'
      }),
      bannerId: Joi.string().allow(null, '').optional().messages({
        'string.base': '"bannerId" bắt buộc phải là những ký tự'
      }),
      verified: Joi.boolean().optional().messages({
        'boolean.base': '"verified" chỉ có thế là \'true\' hoặc \'false\'',
        'boolean.empty': '"verified" không được để trống'
      }), // valid with admin only
      activated: Joi.boolean().optional().messages({
        'boolean.base': '"activated" chỉ có thế là \'true\' hoặc \'false\'',
        'boolean.empty': '"activated" không được để trống'
      }), // valid with admin only
      featured: Joi.boolean().optional().messages({
        'boolean.base': '"featured" chỉ có thế là \'true\' hoặc \'false\'',
        'boolean.empty': '"featured" không được để trống'
      }), // valid with admin only
      featuredTo: Joi.string().optional().messages({
        'string.base': '"featuredTo" bắt buộc phải là những ký tự',
        'string.empty': '"featuredTo" không được để trống'
      }), // valid with admin only
      gaCode: Joi.string().allow(null, '').optional().messages({
        'string.base': '"gaCode" bắt buộc phải là những ký tự'
      }),
      headerText: Joi.string().allow(null, '').optional().messages({
        'string.base': '"headerText" bắt buộc phải là những ký tự'
      }),
      notifications: Joi.object().keys({
        lowInventory: Joi.boolean().optional().messages({
          'boolean.base': '"lowInventory" chỉ có thế là \'true\' hoặc \'false\'',
          'boolean.empty': '"lowInventory" không được để trống'
        })
      }).optional().messages({
        'object.base': '"notifications" bắt buộc phải là 1 object',
        'object.empty': '"notifications" không được để trống'
      }),
      storeWideShipping: Joi.boolean().optional().messages({
        'boolean.base': '"storeWideShipping" chỉ có thế là \'true\' hoặc \'false\'',
        'boolean.empty': '"storeWideShipping" không được để trống'
      }),
      shippingSettings: Joi.object().keys({
        city: Joi.string().optional().messages({
          'string.base': '"city" bắt buộc phải là những ký tự',
          'string.empty': '"city" không được để trống',
          'any.required': 'Yêu cầu phải có "city"'
        }),
        district: Joi.string().optional().messages({
          'string.base': '"district" bắt buộc phải là những ký tự',
          'string.empty': '"district" không được để trống',
          'any.required': 'Yêu cầu phải có "district"'
        }),
        ward: Joi.string().optional().messages({
          'string.base': '"ward" bắt buộc phải là những ký tự',
          'string.empty': '"ward" không được để trống',
          'any.required': 'Yêu cầu phải có "ward"'
        }),
        address: Joi.string().optional().messages({
          'string.base': '"address" bắt buộc phải là những ký tự',
          'string.empty': '"address" không được để trống',
          'any.required': 'Yêu cầu phải có "address"'
        }),
        zipCode: Joi.number().optional().messages({
          'string.base': '"zipCode" bắt buộc phải là những ký tự',
          'string.empty': '"zipCode" không được để trống',
          'any.required': 'Yêu cầu phải có "zipCode"'
        }),
      }).optional().optional()
        .messages({
          'object.base': '"shippingSettings" bắt buộc phải là 1 object',
          'object.empty': '"shippingSettings" không được để trống'
        }),
      announcement: Joi.string().allow(null, '').optional()
    });

    const validate = schema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const shop = await DB.Shop.findOne({ _id: req.params.shopId });
    const oldShop = JSON.parse(JSON.stringify(shop));
    if (shop.ownerId.toString() !== req.user._id.toString() && !req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      return next(PopulateResponse.forbidden());
    }

    const sendMailApprove = !shop.verified && req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) && validate.value.verified;
    const value = !req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) ? _.omit(validate.value, ['verified', 'activated', 'featured']) : validate.value;
    _.merge(shop, value);
    const updatedShop = JSON.parse(JSON.stringify(shop));
    shop.location = await Service.Shop.getLocation(shop);
    await shop.save();

    if (sendMailApprove) {
      await Service.Shop.sendEmailApprove(shop);
    }

    const owner = await DB.User.findOne({ _id: shop.ownerId });
    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      if (validate.value.verified !== undefined && oldShop.verified !== updatedShop.verified) {
        // const userSocial = await Service.User.GetGoldtimeUserId(shop.ownerId);
        // if (userSocial) {
        //   await Service.Vendor.VerifyVendor({
        //     userId: userSocial.socialId,
        //     isVendor: validate.value.verified,
        //     NameVendor: validate.value.name,
        //     Address: validate.value.address,
        //     Phone: validate.value.phoneNumber,
        //     Email: validate.value.email
        //   });
        // }

        const text = validate.value.verified ? `${req.user.username} đã xác nhận cửa hàng ${shop.name}` : `${req.user.username} đã bỏ xác nhận cửa hàng ${shop.name}`;
        await Service.AdminLog.create(owner.username, text, adminLog.status.Changed);
      }

      if (validate.value.activated !== undefined && oldShop.activated !== updatedShop.activated) {
        const text = validate.value.activated ? `${req.user.username} đã kích hoạt cửa hàng ${shop.name}` : `${req.user.username} đã bỏ kích hoạt cửa hàng ${shop.name}`;
        await Service.AdminLog.create(owner.username, text, adminLog.status.Changed);
      }

      delete oldShop.verified;
      delete updatedShop.verified;
      delete oldShop.activated;
      delete updatedShop.activated;

      if (!_.isEqual(oldShop, updatedShop)) {
        await Service.AdminLog.create(owner.username, `${req.user.username} đã thay đổi thông tin cửa hàng ${shop.name}`, adminLog.status.Changed, JSON.stringify(oldShop), JSON.stringify(updatedShop));
      }
    }

    res.locals.update = shop;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.generateLinkQrCode = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isShop || !req.user.shopId) {
      return next(PopulateResponse.error({
        message: 'Tài khoản của bạn chưa đăng ký cửa hàng. Xin vui lòng đăng ký'
      }, 'TÀI KHOẢN CHƯA CÓ CỬA HÀNG'));
    }

    res.locals.qrCode = await Service.Shop.generateLinkQrCode({ userId: req.user._id, shopId: req.user.shopId, params: req.query });
    return next();
  } catch (e) {
    return next(e);
  }
};
