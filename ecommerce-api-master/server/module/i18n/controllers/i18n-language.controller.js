const Joi = require('@hapi/joi');
const _ = require('lodash');

exports.create = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      key: Joi.string().required().messages({
        'string.base': `"key" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "key"`,
        'string.empty': `"key" không được để trống`
      }),
      name: Joi.string().required().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "name"`,
        'string.empty': `"name" không được để trống`
      }),
      flag: Joi.string().allow(null, '').optional().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`
      }),
      isDefault: Joi.boolean().allow(null).optional().messages({
        'boolean.base': `"isDefault" chỉ có thế là 'true' hoặc 'false'`
      }),
      isActive: Joi.boolean().allow(null).optional().messages({
        'boolean.base': `"isActive" chỉ có thế là 'true' hoặc 'false'`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const count = await DB.I18nLanguage.findOne({ key: validate.value.key });
    if (count) {
      return next(PopulateResponse.error({
        message: 'Ngôn Ngữ Này Đã Tồn Tại'
      }));
    }
    const language = new DB.I18nLanguage(validate.value);
    await language.save();

    if (language.isDefault) {
      await DB.I18nLanguage.updateMany({
        _id: { $ne: language._id }
      }, {
        $set: {
          isDefault: false
        }
      });
    }

    res.locals.create = language;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      key: Joi.string().optional().messages({
        'string.base': `"key" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "key"`,
        'string.empty': `"key" không được để trống`
      }),
      name: Joi.string().optional().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "name"`,
        'string.empty': `"name" không được để trống`
      }),
      flag: Joi.string().allow(null, '').optional().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`
      }),
      isDefault: Joi.boolean().allow(null).optional().messages({
        'boolean.base': `"isDefault" chỉ có thế là 'true' hoặc 'false'`
      }),
      isActive: Joi.boolean().allow(null).optional().messages({
        'boolean.base': `"isActive" chỉ có thế là 'true' hoặc 'false'`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const language = await DB.I18nLanguage.findOne({ _id: req.params.languageId });
    if (!language) {
      return next(PopulateResponse.notFound());
    }
    _.merge(language, validate.value);
    await language.save();

    if (language.isDefault) {
      await DB.I18nLanguage.updateMany({
        _id: { $ne: language._id }
      }, {
        $set: {
          isDefault: false
        }
      });
    }

    res.locals.update = language;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const language = await DB.I18nLanguage.findOne({ _id: req.params.languageId });
    if (!language) {
      return next(PopulateResponse.notFound());
    }
    await language.remove();

    res.locals.remove = {
      success: true,
      message: "Xóa Thành Công"
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const query = {};
    if (!req.user || !req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      query.isActive = true;
    }

    const count = await DB.I18nLanguage.countDocuments(query);
    const items = await DB.I18nLanguage.find(query);

    res.locals.list = { count, items };
    next();
  } catch (e) {
    next(e);
  }
};
