const Joi = require("@hapi/joi");

const validateSchema = Joi.object().keys({
  isDeliveryReject: Joi.boolean()
    .allow(null, "")
    .optional(),
  orderStatus: Joi.any()
    .valid(
      "ordered",
      "confirmed",
      "processing",
      "packed",
      "handedOver",
      "shipping",
      "successDelivered",
      "failDelivered",
      "canceled"
    )
    .optional(),
  transportation: Joi.any()
    .allow(null, "")
    .optional(),
    senderId: Joi.any()
    .allow(null, "")
    .optional(),
    senderName: Joi.any()
    .allow(null, "")
    .optional(),
    senderPhone: Joi.any()
    .allow(null, "")
    .optional(),
    reasonReject: Joi.any()
    .allow(null, "")
    .optional(),

});

exports.findOrderByOrderCode = async (req, res, next) => {
  try {
    const orderCode = req.params.orderCode;
    if (!orderCode) {
      return next(PopulateResponse.validationError());
    }
    const order = await Service.Delivery.findOrderByOrderCode(orderCode);
    if (!order) {
      return res.status(404).send(PopulateResponse.notFound());
    }
    req.order = order;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    await Service.Delivery.updateOrder(req.order, validate.value);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.createShipmentHubOrWe = async (req, res, next) => {
  try {
    res.locals.create = await Service.Delivery.createShipmentHubOrWe(req.body);
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.cancelShipmentHubOrWe = async (req, res, next) => {
  try {
    res.locals.cancel = await Service.Delivery.cancelShipmentHubOrWe(req.body);
    return next();
  } catch (e) {
    return next(e);
  }
};
