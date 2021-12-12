const Joi = require('@hapi/joi');

exports.create = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      lang: Joi.string().required().messages({
        'string.base': `"lang" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "lang"`,
        'string.empty': `"lang" không được để trống`
      }),
      textId: Joi.string().required().messages({
        'string.base': `"textId" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "textId"`,
        'string.empty': `"textId" không được để trống`
      }),
      translation: Joi.string().required().messages({
        'string.base': `"translation" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "translation"`,
        'string.empty': `"translation" không được để trống`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const count = await DB.I18nTranslation.findOne({
      textId: validate.value.textId,
      lang: validate.value.lang
    });
    if (count) {
      return next(PopulateResponse.error({
        message: 'Bản dịch này đã tồn tại'
      }));
    }
    const text = await DB.I18nText.findOne({ _id: validate.value.textId });
    if (!text) {
      return next(PopulateResponse.notFound({
        message: 'Không tìm thấy từ khóa này'
      }));
    }
    const data = new DB.I18nTranslation(validate.value);
    data.text = text.text;
    await data.save();

    res.locals.create = data;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      translation: Joi.string().required().messages({
        'string.base': `"translation" bắt buộc phải là những ký tự`,
        'any.required': `Yêu cầu phải có "translation"`,
        'string.empty': `"translation" không được để trống`
      }),
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    const data = await DB.I18nTranslation.findOne({ _id: req.params.translationId });
    if (!data) {
      return next(PopulateResponse.notFound());
    }
    data.translation = validate.value.translation;
    await data.save();

    res.locals.update = data;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const translation = await DB.I18nTranslation.findOne({ _id: req.params.translationId });
    if (!translation) {
      return next(PopulateResponse.notFound());
    }
    await translation.remove();

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
    const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(req.query.take, 10);
   
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['text', 'translation'],
      equal: ['lang']
    });

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.I18nTranslation.countDocuments(query);
    const items = await DB.I18nTranslation.find(query)
      .collation({ locale: 'en' })
      .sort(sort).skip(page * take)
      .limit(take)
      .exec();

    res.locals.list = {
      count,
      items
    };

    next();
  } catch (e) {
    next();
  }
};

exports.pull = async (req, res, next) => {
  try {
    // pull the text to translation
    const text = await DB.I18nText.find();
    // const textMapping = text.map(t => t.text);
    await Promise.all(text.map(t => DB.I18nTranslation.countDocuments({
      text: t.text,
      textId: t._id,
      lang: req.params.lang
    })
      .then((count) => {
        if (!count) {
          return DB.I18nTranslation.create({
            text: t.text,
            textId: t._id,
            translation: t.text,
            lang: req.params.lang
          });
        }
       
        console.log()
        return true;
      })));

    res.locals.pull = { success: true, message: "Đẩy Chữ Vào Thành Công" };
    next();
  } catch (e) {
    next(e);
  }
};

exports.updateTranslationId = async (req, res, next) => {
  try {
    // pull the text to translation
    const text = await DB.I18nText.find();

    await Promise.all(text.map(t =>  DB.I18nTranslation.updateMany(
            {text: t.text},
            { $set: { textId : t._id} }
          )));
        
    res.locals.updated = { success: true, message: "Cập nhật id bản dịch thành công" };
    next();
  } catch (e) {
    next(e);
  }
}

exports.sendJSON = async (req, res, next) => {
  try {
    // TODO - check activated languages
    const data = await DB.I18nTranslation.find({ lang: req.params.lang });
    const items = data.length ? Object.assign(...data.map((item) => {
      const response = {};
      response[item.text] = item.translation;
      return response;
    })) : {};

    res.status(200).send(items);
  } catch (e) {
    next(e);
  }
};
