const _ = require('lodash');
const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  value: Joi.any().required()
});

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.configId || req.body.configId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const config = await DB.Config.findOne({ _id: id });
    if (!config) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.config = config;
    res.locals.config = config;
    return next();
  } catch (e) {
    return next(e);
  }
};


/**
 * do update
 */
exports.update = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    _.assign(req.config, req.body);
    const saveRes = await req.config.save();
    if(saveRes){
      const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      await Service.Config.publicConfig({ queryCountry: req.query.country, ip, resetRedis: true });
    }

    res.locals.update = req.config;
    return next();
  } catch (e) {
    return next();
  }
};

/**
 * get list config
 */
exports.list = async (req, res, next) => {
  try {
    const query = {isActived: true};
    const count = await DB.Config.countDocuments(query);
    const items = await DB.Config.find(query).sort({priority: 1})
      .exec();

    res.locals.configs = {
      count,
      items
    };
    next();
  } catch (e) {
    next();
  }
};

exports.publicConfig = async (req, res, next) => {
  try {
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const data = await Service.Config.publicConfig({ queryCountry: req.query.country, ip });
    res.locals.publicConfig = data;
    next();
  } catch (e) {
    next();
  }
};

exports.tradeDiscount = async (req, res, next) => {
  try {
    const data = await Service.Config.tradeDiscount();
    res.locals.tradeDiscount = data;
    next();
  } catch (e) {
    next();
  }
};
