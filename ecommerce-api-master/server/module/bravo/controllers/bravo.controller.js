const _ = require('lodash');
const moment = require('moment');
const Joi = require('@hapi/joi');

// test WCAuthen
exports.WCDAuthen = async (req, res, next) => {
  try {
    const result = await Service.Bravo.Request_WCDAuthen();
    res.locals.message = result;
    return next();
  } catch (e) {
    return next(e);
  }
};

// test WCDClearSession
exports.WCDClearSession = async (req, res, next) => {
  try {
    const result = await Service.Bravo.Request_WCDClearSession();
    res.locals.message = result;
    return next();
  } catch (e) {
    return next(e);
  }
};

// test WCDWritePO
exports.WCDWritePO = async (req, res, next) => {
    try {
        if(req.body && req.body.orderId){
          const order = await DB.Order.findOne({_id: req.body.orderId}).populate('customer');

          const result = await Service.Bravo.WCDWritePO(order, req.body.wcdCode);

          res.locals.data = result;
          return next();
        }else{
          return next(PopulateResponse.notFound());
        }
    } catch (e) {
      return next(e);
    }
};

// test WCDWritePODetail
exports.WCDWritePODetail = async (req, res, next) => {
    try {
        if(req.body && req.body.orderId){
          const order = await DB.Order.findOne({_id: req.body.orderId}).populate('customer');
          const orderDetails = await DB.OrderDetail.find({orderId: req.body.orderId}).populate('product');

          const result = await Service.Bravo.WCDWritePODetail(order, orderDetails);

          res.locals.data = result;
          return next();
        }else{
          return next(PopulateResponse.notFound());
        }
    } catch (e) {
      return next(e);
    }
};


// test WCDGetPODocNo
exports.WCDGetPODocNo = async (req, res, next) => {
  try {
      if(req.body && req.body.orderId){
        const order = await DB.Order.findOne({_id: req.body.orderId}).populate('customer');

        const result = await Service.Bravo.WCDGetPODocNo(order, req.body.wcdCode);

        res.locals.data = result;
        return next();
      }else{
        return next(PopulateResponse.notFound());
      }
  } catch (e) {
    return next(e);
  }
};

// test WCDCheckPODocNo
exports.WCDCheckPODocNo = async (req, res, next) => {
  try {
    if(req.body && req.body.orderId){
      const order = await DB.Order.findOne({_id: req.body.orderId}).populate('customer');

      const result = await Service.Bravo.WCDCheckPODocNo(order, req.body.docNo);

      res.locals.data = result;
      return next();
    }else{
      return next(PopulateResponse.notFound());
    }
  } catch (e) {
    return next(e);
  }
};

exports.WCDLoadPOinfo = async (req, res, next) => {
  try {
    if(req.query && req.query.bizDocId && req.query.docNo){
      const result = await Service.Bravo.WCDLoadPOinfo(req.query);
      res.locals.data = result;
      return next();
    }else{
      return next(PopulateResponse.notFound());
    }
  } catch (e) {
    return next(e);
  }
};

exports.WCDLoadPOinfoDetail = async (req, res, next) => {
  try {
    if(req.query && req.query.bizDocId && req.query.docNo){
      const result = await Service.Bravo.WCDLoadPOinfoDetail(req.query);
      res.locals.data = result;
      return next();
    }else{
      return next(PopulateResponse.notFound());
    }
  } catch (e) {
    return next(e);
  }
};

exports.SendOrderDataToBravo = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      orderId: Joi.string().optional().messages({
        'string.base': `"orderId" bắt buộc phải là những ký tự`,
        'string.empty': `"orderId" không được để trống`
      }),
    });

    const validate = validateSchema.validate(req.body);

    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const result = await Service.Bravo.SendOrderDataToBravo(validate.value.orderId);
    res.locals.data = result;
    return next();
  } catch (e) {
    return next(e);
  }
};