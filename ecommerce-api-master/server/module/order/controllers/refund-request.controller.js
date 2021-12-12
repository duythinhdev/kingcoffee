const Joi = require('@hapi/joi');

exports.request = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      reason: Joi.string().required().messages({
        'string.base': `"reason" bắt buộc phải là những ký tự`,
        'string.empty': `"reason" không được để trống`,
        'any.required': `Yêu cầu phải có "reason"`
      }),
      orderDetailId: Joi.string().required().messages({
        'string.base': `"orderDetailId" bắt buộc phải là những ký tự`,
        'string.empty': `"orderDetailId" không được để trống`,
        'any.required': `Yêu cầu phải có "orderDetailId"`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const refundRequest = await Service.Order.requestRefund({
      orderDetailId: validate.value.orderDetailId,
      reason: validate.value.reason
    });

    res.locals.request = refundRequest;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const query = {};
    // check role query
    // TODO - if admin, we dont need to query by customer
    if (req.user.shopId && req.headers.platform === 'seller') {
      query.shopId = req.user.shopId;
    } else if (!req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value) || req.headers.platform !== 'admin') {
      // query from the user side, show just request of the customer
      query.customerId = req.user._id;
    }

    const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(req.query.take, 10) || 10;

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.RefundRequest.countDocuments(query);
    const items = await DB.RefundRequest.find(query)
      .populate('orderDetail')
      .populate('shop')
      .populate('customer')
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    res.locals.list = {
      count,
      items: items.map((item) => {
        const data = item.toObject();
        if (item.customer) {
          data.customer = item.customer.toJSON();
        }
        data.details = item.details || [];
        data.codVerifyCode = '';
        return data;
      })
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.details = async (req, res, next) => {
  try {
    const details = await DB.RefundRequest.findOne({ _id: req.params.refundRequestId })
      .populate('orderDetail')
      .populate('shop')
      .populate('customer')
      .exec();

    res.locals.details = details;
    next();
  } catch (e) {
    next(e);
  }
};
