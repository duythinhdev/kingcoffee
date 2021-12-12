/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const Joi = require('@hapi/joi');
const fs = require('fs');
const moment = require('moment');

exports.create = async (req, res, next) => {
  try {
    return next(PopulateResponse.error());
    const validateSchema = Joi.object().keys({
      productId: Joi.string().required().messages({
        'string.base': '"productId" bắt buộc phải là những ký tự',
        'any.required': 'Yêu cầu phải có "productId"',
        'string.empty': '"productId" không được để trống'
      }),
      code: Joi.string().required().messages({
        'string.base': '"code" bắt buộc phải là những ký tự',
        'any.required': 'Yêu cầu phải có "code"',
      }),
      quantity: Joi.number().required().messages({
        'number.base': '"quantity" bắt buộc phải là 1 số',
        'number.empty': '"quantity" không được để trống',
        'any.required': 'Yêu cầu phải có "quantity"'
      }),
    });

    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const [product, logEvent] = await Promise.all([
      DB.Product.findOne({
        _id: req.body.productId,
        fiveElement: true,
        isActive: true
      }).populate('shop').populate('mainImage'),
      DB.LogEvent.findOne({ username: req.user.username, level: 'insertEvent' })
    ]);

    if (!product) {
      throw new Error('Sản phẩm không tồn tại hoặc đã bị xóa');
    }

    if (logEvent) {
      if (logEvent.status === 1) {
        return next(PopulateResponse.success(null, 'Bạn đã đặt mua vé Ngũ Hành Tương Sinh. Hệ thống đang xử lý, vui lòng chờ trong giây lát...'));
      }

      if (logEvent.status === 2) {
        return next(PopulateResponse.success(null, 'Bạn đã mua vé Ngũ Hành Tương Sinh thành công, vui lòng kiểm tra hòm thư email, xin cảm ơn!'));
      }
    }

    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const params = Object.assign({
      userIP,
      userAgent
    }, req.body);

    try {
      const data = await Service.Event.createEventRequest({
        ownerId: req.user._id,
        ownerName: req.user.username,
        email: req.user.email,
        params
      });

      if (!data) {
        return next(PopulateResponse.error(null, 'Mua vé không thành công'));
      }

      return next(PopulateResponse.success(null, 'Bạn đã mua vé Ngũ Hành Tương Sinh thành công, vui lòng kiểm tra hòm thư email, xin cảm ơn!'));
    } catch (error) {
      return next(error);
    }
  } catch (e) {
    return next(e);
  }
};

exports.search = async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = {
      level: -1,
      pageNumber: page,
      pageSize: take,
      ownerName: req.query.ownerName || '',
      fatherName: req.query.parentName || '',
      sponsorName: req.query.sponsorName || '',
      ticketCode: req.query.code || ''
    };

    const getlist = await Service.RequestNHTS.getList(query);
    const count = getlist.length > 0 ? getlist[0].totalRow : 0;

    const items = [];
    for (const item of getlist) {
      const [product, sponsor, parent, owner] = await Promise.all([
        DB.Product.findOne({ isActive: true, fiveElement: true }),
        DB.User.findOne({ username: item.sponsorName }),
        DB.User.findOne({ username: item.fatherName }),
        DB.User.findOne({ username: item.ownerName })
      ]);

      items.push({
        level: item.level,
        numberChild: item.numberChild,
        code: item.ticketCode,
        sponsorId: sponsor ? sponsor._id : null,
        sponsorName: item.sponsorName,
        parentId: parent ? parent._id : null,
        parentName: item.fatherName,
        ownerId: owner ? owner._id : null,
        ownerName: item.ownerName,
        productId: product ? product._id : null,
        createdAt: item.createdDate,
        updatedAt: item.modifiedDate,
        parent: {
          phoneNumber: parent ? parent.phoneNumber : null,
          _id: parent ? parent._id : null,
          email: parent ? parent.email : '',
          name: parent ? parent.name : '',
          avatarUrl: parent ? parent.avatarUrl : ''
        },
        owner: {
          phoneNumber: owner ? owner.phoneNumber : null,
          _id: owner ? owner._id : null,
          email: owner ? owner.email : '',
          name: owner ? owner.name : '',
          avatarUrl: owner ? owner.avatarUrl : ''
        },
        sponsor: {
          phoneNumber: sponsor ? sponsor.phoneNumber : null,
          _id: sponsor ? sponsor._id : null,
          email: sponsor ? sponsor.email : '',
          name: sponsor ? sponsor.name : '',
          avatarUrl: sponsor ? sponsor.avatarUrl : ''
        }
      });
    }

    res.locals.search = { count, items };

    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getTotalInfo = async (req, res, next) => {
  try {
    const getTotal = await Service.RequestNHTS.getTotal();

    res.locals.data = getTotal;

    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getRandomWinner = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      productId: Joi.string().required().messages({
        'string.base': '"productId" bắt buộc phải là những ký tự',
        'any.required': 'Yêu cầu phải có "productId"',
        'string.empty': '"productId" không được để trống'
      }),
    });

    const validate = validateSchema.validate(req.query);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const [eventProduct, getWinTicketCode] = await Promise.all([
      DB.EventProduct.findOne({ status: true, productId: req.query.productId }).populate('product', '_id name alias salePrice'),
      Service.RequestNHTS.getWinTickCode()
    ]);

    if (!getWinTicketCode || getWinTicketCode.statusCode !== 200) {
      throw new Error('Lấy mã quay thưởng không thành công');
    }

    if (!getWinTicketCode.data.ownerName) {
      throw new Error('Không tìm thấy tài khoản');
    }

    if (!eventProduct) {
      throw new Error('Không tìm thấy sản phẩm trúng thưởng');
    }

    const eventVoucher = new DB.EventVoucher({
      code: getWinTicketCode.data.voucher,
      eventProductId: eventProduct._id,
    });

    const [winner, ins, upd] = await Promise.all([
      Service.EventWinners.create({
        username: getWinTicketCode.data.ownerName,
        code: parseInt(getWinTicketCode.data.ticketCode, 10),
        admin: req.user.username,
        eventVoucherId: eventVoucher._id
      }),
      eventVoucher.save(),
      DB.EventProduct.update(
        { _id: eventProduct._id },
        { $push: { eventVoucherId: eventVoucher._id } }
      )
    ]);

    if (winner) {
      Service.EventWinners.sendEmailReward({
        username: getWinTicketCode.data.ownerName,
        product: eventProduct.product,
        code: getWinTicketCode.data.voucher,
        ticketCode: parseInt(getWinTicketCode.data.ticketCode, 10),
        date: moment(winner.createdAt).format('DD-MM-YYYY'),
        email: getWinTicketCode.data.email
      });
    }

    res.locals.data = Object.assign(winner, { code: getWinTicketCode.data.ticketCode });
    next();
  } catch (e) {
    if (e.NHTS_CODE) {
      next(PopulateResponse.error(
        {
          message: 'Lấy mã quay thưởng không thành công'
        },
        'NHTS_CODE'
      ));
    } else {
      next(e);
    }
  }
};

exports.resendMail = async (req, res, next) => {
  try {
    const productId = Helper.App.isMongoId(req.query.productId) ? req.query.productId : Helper.App.toObjectId(req.query.productId);
    const product = await DB.Product.findOne({
      _id: productId
    });
    if (!product) {
      return next(PopulateResponse.error(
        {
          message: 'Sản phẩm không tồn tại hoặc đã bị xóa'
        },
        'PRODUCT NOT EXITS'
      ));
    }
    // const ownerId = Helper.App.isMongoId(req.query.ownerId) ? req.query.ownerId : Helper.App.toObjectId(req.query.ownerId);
    // const getCode = await DB.Event.findOne({
    //   ownerId
    // });
    // if (!getCode) {
    //   return next(PopulateResponse.error(
    //     {
    //       message: 'Người giới thiệu không tồn tại trong hệ thống'
    //     },
    //     'USER NOT EXITS'
    //   ));
    // }
    Service.Event.sendEmailBuyTicketSuccess(req.query.productId, req.query.code, req.query.ownerName);
    res.locals.resendMail = true;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.eventWinnerList = async (req, res, next) => {
  try {
    const result = await Service.EventWinners.list(req.query);

    res.locals.list = result;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.eventWinnerDetail = async (req, res, next) => {
  try {
    const result = await Service.EventWinners.detail({
      eventWinnerId: req.params.id
    });

    res.locals.detail = result;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.eventWinnerUpdate = async (req, res, next) => {
  try {
    const result = await Service.EventWinners.update(Object.assign({
      eventWinnerId: req.params.id,
      username: req.user.username
    }, req.body));

    res.locals.update = result;
    return next();
  } catch (e) {
    return next(e);
  }
};

// Get list for sellers
exports.eventWinnerListOfSeller = async (req, res, next) => {
  try {
    const result = await Service.EventWinners.sellerList(req.query);

    res.locals.list = result;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(PopulateResponse.error({
        message: 'Xin vui lòng tải file lên'
      }, 'CHƯA CÓ FILE'));
    }

    if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      fs.unlinkSync(req.file.path);
      return next(PopulateResponse.error({
        message: 'Xin vui lòng tải file với đuôi .xlsx'
      }, 'SAI ĐỊNH DẠNG FILE'));
    }

    const result = await Service.Event.import({
      file: req.file
    });

    fs.unlinkSync(req.file.path);

    if (result.code === 400) {
      return next(PopulateResponse.error(
        {
          message: result.msg
        },
        'USER_NOT_EXIST_IMPORT_EVENT'
      ));
    }

    if (result.isImport) {
      return next(PopulateResponse.error(
        {
          message: 'Bạn đã import, không thể tiếp tục import'
        },
        'BẠN ĐÃ IMPORT'
      ));
    }

    res.locals.excel = result;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.getVoucher = async (req, res, next) => {
  try {
    res.locals.data = await Service.EventWinners.getVoucher(req.query);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.payment = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      productId: Joi.string().required().messages({
        'string.base': '"productId" bắt buộc phải là những ký tự',
        'string.empty': '"productId" không được để trống',
        'any.required': 'Yêu cầu phải có "productId"'
      }),
      quantity: Joi.number().required().min(0).messages({
        'number.base': '"quantity" bắt buộc phải là 1 số',
        'number.empty': '"quantity" không được để trống'
      }),
      voucher: Joi.string().required().messages({
        'string.base': '"voucher" bắt buộc phải là những ký tự',
        'string.empty': '"voucher" không được để trống',
      }),
      phoneNumber: Joi.string().required().messages({
        'string.base': '"phoneNumber" bắt buộc phải là những ký tự',
        'string.empty': '"phoneNumber" không được để trống',
        'any.required': 'Yêu cầu phải có "phoneNumber"'
      }),
      name: Joi.string().required().messages({
        'string.base': '"name" bắt buộc phải là những ký tự',
        'string.empty': '"name" không được để trống',
        'any.required': 'Yêu cầu phải có "name"'
      }),
      streetAddress: Joi.string().required().messages({
        'string.base': '"streetAddress" bắt buộc phải là những ký tự',
        'string.empty': '"streetAddress" không được để trống',
        'any.required': 'Yêu cầu phải có "streetAddress"'
      }),
      shippingType: Joi.string().required().messages({
        'string.base': '"shippingType" bắt buộc phải là những ký tự',
        'string.empty': '"shippingType" không được để trống',
        'any.required': 'Yêu cầu phải có "shippingType"'
      }),
      description: Joi.string().messages({
        'string.base': '"description" bắt buộc phải là những ký tự',
      }),
      email: Joi.string().messages({
        'string.base': '"email" bắt buộc phải là những ký tự',
        'string.empty': '"email" không được để trống',
        'any.required': 'Yêu cầu phải có "email"'
      })
    }).options({ stripUnknown: true });

    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    const data = Object.assign({ userIP, userAgent }, validate.value);
    const order = await Service.EventWinners.payment({ data, user: req.user });

    res.locals.data = order;
    return next();
  } catch (e) {
    if (e.RES_MES) {
      return next(PopulateResponse.error({ message: e.RES_MES }, e.RES_MES));
    }
    return next(e);
  }
};
