const Joi = require("@hapi/joi");

const validateSchema = Joi.object().keys({
  orderId: Joi.string().required(),
  eventType: Joi.string().required(),
});

exports.find = async (req, res, next) => {
  try {
    console.log(req.query);
    const validate = validateSchema.validate(req.query);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }
    //const { orderId, eventType } = validate.value;

    const orderLogs = await Service.OrderLog.find(
      req.query
    );

    if (!orderLogs || orderLogs.length === 0) {
      return next(
        PopulateResponse.error(
          {
            message: "Logs không tồn tại hoặc đã bị xóa",
          },
          "LOGS NOT EXITS"
        )
      );
    }

    res.locals.list = orderLogs;
    return next();
  } catch (e) {
    next(e);
  }
};
