const Joi = require('@hapi/joi');
const _ = require('lodash');

exports.register = async (req, res, next) => {
  try {
    const validateSchema = Joi.object().keys({
      username: Joi.string().required().messages({
        'string.base': `"username" bắt buộc phải là những ký tự`,
        'string.empty': `"username" không được để trống`,
        'any.required': `Yêu cầu phải có "username"`
      }),
      email: Joi.string().allow(null, '').optional().messages({
        'string.base': `"email" bắt buộc phải có dạng 'example@gmail.com'`
      }),
      name: Joi.string().allow(null, '').optional().messages({
        'string.base': `"name" bắt buộc phải là những ký tự`
      }),
      address: Joi.string().allow(null, '').optional().messages({
        'string.base': `"address" bắt buộc phải là những ký tự`
      })
    });
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    let contact = await DB.Contact.findOne({ username: validate.value.username });
    if (!contact) {
      contact = new DB.Contact(validate.value);
    }

    _.merge(contact, validate.value);
    await contact.save();
    res.locals.register = { success: true, message: "Đăng Ký Thành Công" };
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
      text: ['name', 'username']
    });

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.Contact.countDocuments(query);
    const items = await DB.Contact.find(query)
      .collation({ locale: 'en' })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    res.locals.list = {
      count,
      items
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await DB.Contact.remove({ _id: req.params.contactId });
    res.locals.remove = { success: true, message: "Xóa Thành Công" };
    next();
  } catch (e) {
    next(e);
  }
};
