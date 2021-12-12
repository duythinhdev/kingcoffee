const Joi = require('@hapi/joi');
const _ = require('lodash');

const validateSchema = Joi.object().keys({
  type: Joi.string().allow('paypal', 'bank-account').required().messages({
    'string.base': `"type" bắt buộc phải là những ký tự`,
    'string.empty': `"type" không được để trống`,
    'any.required': `Yêu cầu phải có "type"`
  }),
  paypalAccount: Joi.string().allow(null, '').when('type', {
    is: 'paypal',
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'string.base': `"paypalAccount" bắt buộc phải là những ký tự`
  }),
  accountHolderName: Joi.string().allow(null, '').messages({
    'string.base': `"accountHolderName" bắt buộc phải là những ký tự`
  }),
  accountNumber: Joi.string().allow(null, '').messages({
    'string.base': `"accountNumber" bắt buộc phải là những ký tự`
  }),
  iban: Joi.string().allow(null, '').messages({
    'string.base': `"iban" bắt buộc phải là những ký tự`
  }),
  bankName: Joi.string().allow(null, '').messages({
    'string.base': `"bankName" bắt buộc phải là những ký tự`
  }),
  bankAddress: Joi.string().allow(null, '').messages({
    'string.base': `"bankAddress" bắt buộc phải là những ký tự`
  }),
  sortCode: Joi.string().allow(null, '').messages({
    'string.base': `"sortCode" bắt buộc phải là những ký tự`
  }),
  routingNumber: Joi.string().allow(null, '').messages({
    'string.base': `"routingNumber" bắt buộc phải là những ký tự`
  }),
  swiftCode: Joi.string().allow(null, '').messages({
    'string.base': `"swiftCode" bắt buộc phải là những ký tự`
  }),
  ifscCode: Joi.string().allow(null, '').messages({
    'string.base': `"ifscCode" bắt buộc phải là những ký tự`
  }),
  routingCode: Joi.string().allow(null, '').messages({
    'string.base': `"routingCode" bắt buộc phải là những ký tự`
  })
});

exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    const payoutAccount = new DB.PayoutAccount(Object.assign(validate.value, {
      userId: req.user._id,
      shopId: req.user.shopId
    }));
    await payoutAccount.save();
    res.locals.create = payoutAccount;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const payoutAccount = await DB.PayoutAccount.findOne({
      _id: req.params.payoutAccountId
    });
    if (!payoutAccount) {
      return next(PopulateResponse.notFound());
    }

    req.payoutAccount = payoutAccount;
    res.locals.payoutAccount = payoutAccount;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    _.merge(req.payoutAccount, validate.value);
    await req.payoutAccount.save();
    res.locals.update = req.payoutAccount;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(req.query.take, 10) || 10;
    const query = Helper.App.populateDbQuery(req.query, {
      equal: ['type']
    });
    const sort = Helper.App.populateDBSort(req.query);
    query.userId = req.user._id;
    const count = await DB.PayoutAccount.countDocuments(query);
    const items = await DB.PayoutAccount.find(query)
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();
    res.locals.list = {
      count,
      items
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    req.payoutAccount.remove();
    res.locals.remove = { success: true, message: "Xóa Thành Công" };
    next();
  } catch (e) {
    next(e);
  }
};
