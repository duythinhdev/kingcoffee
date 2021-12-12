const _ = require('lodash');
const Joi = require('@hapi/joi');

const validateSchema = Joi.object().keys({
  title: Joi.string().required().messages({
    'string.base': `"title" bắt buộc phải là những ký tự`,
    'string.empty': `"title" không được để trống`,
    'any.required': `Yêu cầu phải có "title"`
  }),
  alias: Joi.string().allow(null, '').optional().messages({
    'string.base': `"alias" bắt buộc phải là những ký tự`
  }),
  content: Joi.string().allow(null, '').optional().messages({
    'string.base': `"content" bắt buộc phải là những ký tự`
  }),
  description: Joi.string().allow(null, '').optional().messages({
    'string.base': `"description" bắt buộc phải là những ký tự`
  }),
  ordering: Joi.number().allow(null, '').optional().messages({
    'number.base': `"ordering" bắt buộc phải là 1 số`
  }),
  isMain: Joi.boolean().allow(null).optional().messages({
    'boolean.base': `"isMain" chỉ có thế là 'true' hoặc 'false'`
  }),
  isActive: Joi.boolean().allow(null).optional().messages({
    'boolean.base': `"isActive" chỉ có thế là 'true' hoặc 'false'`
  }),
  categoryIds: Joi.array().items(Joi.string()).optional().default([]).messages({
    'array.base': `"categoryIds" bắt buộc phải là 1 mảng`,
    'array.empty': `"categoryIds" không được để trống`
  }),
  type: Joi.string().allow(null, '').optional().default('post').messages({
    'string.base': `"type" bắt buộc phải là những ký tự`
  }),
  image: Joi.string().allow(null, '').optional().messages({
    'string.base': `"image" bắt buộc phải là những ký tự`,
  }),
});

exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.postId || req.body.postId;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const query = Helper.App.isMongoId(id) ? { _id: id } : { alias: id };
    const post = await DB.Post.findOne(query)
      .populate('image');
    if (!post) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.post = post;
    res.locals.post = post;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new media post
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    if(validate.value.isMain) {
      const existMain = await DB.Post.findOne({categoryIds: Helper.App.toObjectId(validate.value.categoryIds[0]), isMain: true});
      console.log(existMain);
      if(existMain) {
        throw new Error(`Bài viết ${existMain.title} đã được thiết lập là bài viết chính cho danh mục này`)
      }
    }

    let alias = req.body.alias ? Helper.String.createAlias(req.body.alias) : Helper.String.createAlias(req.body.name);
    const count = await DB.Post.countDocuments({ alias });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    const post = new DB.Post(Object.assign(validate.value, {
      alias
    }));
    await post.save();
    res.locals.post = post;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * do update for user profile or admin update
 */
exports.update = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    if(validate.value.isMain) {
      const existMain = await DB.Post.findOne({_id: {$ne: req.post._id}, categoryIds: Helper.App.toObjectId(validate.value.categoryIds[0]), isMain: true});
      if(existMain) {
        throw new Error(`Bài viết ${existMain.title} đã được thiết lập là bài viết chính cho danh mục này`)
      }
    }

    let alias = req.body.alias ? Helper.String.createAlias(req.body.alias) : Helper.String.createAlias(req.body.name);
    const count = await DB.Post.countDocuments({
      alias,
      _id: { $ne: req.post._id }
    });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    _.merge(req.post, validate.value);
    if (req.body.categoryIds) {
      req.post.categoryIds = req.body.categoryIds;
    }
    await req.post.save();
    res.locals.update = req.post;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await req.post.remove();
    res.locals.remove = {
      message: 'Đã Xóa Bài Viết'
    };
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * get list post
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ['title', 'alias'],
      boolean: ['isActive'],
      equal: ['type']
    });

    if(req.query.categoryIds) {
      query.categoryIds = Helper.App.toObjectId(req.query.categoryIds);
    }

    if(req.query.categoryAlias){
      const postCategory = await DB.PostCategory.findOne({alias: req.query.categoryAlias});
      if(postCategory)
        query.categoryIds = postCategory._id
    }

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.Post.countDocuments(query);
    const items = await DB.Post.find(query)
      .populate({ path: 'categoryIds', select: 'name' })
      .populate({ path: 'image', select: 'filePath' })
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

// Lấy các bài post tin tức ngoài homepage
exports.shortList = async (req, res, next) => {
  try {
    let getObjectId = "";
    const query = {
      type: 'post',
      isActive: 'true',
      categoryIds:'',
    }

    // const alias = "tin-tuc";
    // getObjectId = await DB.PostCategory.findOne({alias: alias});
    if(req.query.alias) {
      getObjectId = await DB.PostCategory.findOne({alias: req.query.alias});
    } else {
      throw new Error("Phải có param cho alias");
    }

    query.categoryIds = getObjectId._id;

    if(getObjectId._id){
      const main = await DB.Post.findOne({categoryIds: getObjectId._id, isMain: true})
        .populate({ path: 'image', select: 'filePath' })
        .select({title: 1, description: 1, createdAt: 1, isMain: 1, alias: 1})
        .exec();
      const items = await DB.Post.find(query)
        .select({title: 1, description: 1, createdAt: 1, isMain: 1, alias: 1})
        .populate({ path: 'categoryIds', select: 'name' })
        .populate({ path: 'image', select: 'filePath' })
        .collation({ locale: 'en' })
        .sort({createdAt: -1})
        .limit(4)
        .exec();
        res.locals.list = {
          main,
          items
        };
    }
    next();
  } catch (e) {
    next(e);
  }
};

exports.updateAliasForAllPost = async (req, res, next) => {
  try{
    await Service.Post.updateAliasForAllPost();
    return next();
  }catch(e){
    return next(e);
  }
};