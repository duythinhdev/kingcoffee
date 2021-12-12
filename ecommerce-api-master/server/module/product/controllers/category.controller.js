const _ = require("lodash");
const Joi = require("@hapi/joi");

const validateSchema = Joi.object().keys({
  name: Joi.string()
    .required()
    .messages({
      "string.base": `"name" bắt buộc phải là những ký tự`,
      "string.empty": `"name" không được để trống`,
      "any.required": `Yêu cầu phải có "name"`
    }),
  alias: Joi.string()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": `"alias" bắt buộc phải là những ký tự`
    }),
  description: Joi.string()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": `"description" bắt buộc phải là những ký tự`
    }),
  ordering: Joi.number()
    .allow(null, "")
    .optional()
    .messages({
      "number.base": `"ordering" bắt buộc phải là 1 số`
    }),
  parentId: Joi.string()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": `"parentId" bắt buộc phải là những ký tự`
    }),
  mainImage: Joi.string()
    .allow(null, "")
    .optional()
    .default(null)
    .messages({
      "string.base": `"mainImage" bắt buộc phải là những ký tự`
    }),
  specifications: Joi.array()
    .items(Joi.string())
    .optional()
    .default([])
    .messages({
      "array.base": `"specifications" bắt buộc phải là 1 mảng`,
      "array.empty": `"specifications" không được để trống`
    }),
  chemicalIdentifiers: Joi.array()
    .items(Joi.string())
    .optional()
    .default([])
    .messages({
      "array.base": `"specifications" bắt buộc phải là 1 mảng`,
      "array.empty": `"specifications" không được để trống`
    }),
  metaSeo: Joi.object()
    .keys({
      keywords: Joi.string()
        .allow(null, "")
        .optional()
        .messages({
          "string.base": `"keywords" bắt buộc phải là những ký tự`
        }),
      description: Joi.string()
        .allow(null, "")
        .optional()
        .messages({
          "string.base": `"description" bắt buộc phải là những ký tự`
        })
    })
    .optional(),
  isActive: Joi.boolean()
    .allow(null, "")
    .optional()
    .messages({
      "string.base": `"isActive" bắt buộc phải là đúng sai`
    }),
  isPromotion: Joi.boolean()
  .allow(null, "")
  .messages({
    "boolean.base": `"isPromotion" bắt buộc phải là đúng sai`
  })
});

exports.findOne = async (req, res, next) => {
  try {
    const id =
      req.params.id ||
      req.params.productCategoryId ||
      req.body.productCategoryId;
    const query = {};
    if (Helper.App.isMongoId(id)) {
      query._id = id;
    } else {
      query.alias = id;
    }
    query.isDeleted = false;
    if (!id) {
      return next(PopulateResponse.validationError());
    }
    const productCategory = await DB.ProductCategory.findOne(query).populate(
      "mainImage"
    );
    if (!productCategory) {
      return res.status(404).send(PopulateResponse.notFound());
    }

    req.productCategory = productCategory;
    res.locals.productCategory = productCategory;
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * Create a new media productCategory
 */
exports.create = async (req, res, next) => {
  try {
    const validate = validateSchema.validate(req.body);
    if (validate.error) {
      return next(PopulateResponse.validationError(validate.error));
    }

    let alias = req.body.alias
      ? Helper.String.createAlias(req.body.alias)
      : Helper.String.createAlias(req.body.name);
    const count = await DB.ProductCategory.countDocuments({ alias });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    validate.value.parentId = validate.value.parentId
      ? validate.value.parentId
      : null;
    if (validate.value.parentId) {
      const getCategory = await DB.ProductCategory.findOne(
        { _id: validate.value.parentId, isDeleted: false },
        { type: 1, level: 1 }
      );
      if (getCategory) {
        if (getCategory.level + 1 > 3)
          return next(
            PopulateResponse.error(null, "Cannot create category over level 3!")
          );

        const haveProduct = await DB.Product.findOne({
          categoryId: validate.value.parentId,
          isDeleted: false
        });
        if (haveProduct)
          return next(
            PopulateResponse.error(null, "Parent product category had product!")
          );

        validate.value.type = getCategory.type;
        validate.value.level = getCategory.level + 1;
      }
    } else {
      validate.value.type = validate.value.alias;
    }

    //check category name is exist
    const existCategory = await DB.ProductCategory.find({
      name: { $regex: validate.value.name.toString(), $options: "i" },
      isDeleted: false
    });
    if (existCategory[0] !== undefined) {
      return next(
        PopulateResponse.error(null, "This product category name has existed!")
      );
    }

    const productCategory = new DB.ProductCategory(
      Object.assign(validate.value, {
        alias
      })
    );
    await productCategory.save();
    res.locals.productCategory = productCategory;
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

    let alias = req.body.alias
      ? Helper.String.createAlias(req.body.alias)
      : Helper.String.createAlias(req.body.name);
    const count = await DB.ProductCategory.countDocuments({
      alias,
      _id: { $ne: req.productCategory._id }
    });
    if (count) {
      alias = `${alias}-${Helper.String.randomString(5)}`;
    }

    if (validate.value.parentId) {
      const getCategory = await DB.ProductCategory.findOne(
        { _id: validate.value.parentId, isDeleted: false },
        { type: 1, level: 1 }
      );
      if (getCategory) {
        if (getCategory.level + 1 > 3)
          return next(
            PopulateResponse.error(null, "Cannot update category over level 3!")
          );

        const haveProduct = await DB.Product.findOne({
          categoryId: validate.value.parentId,
          isDeleted: false
        });
        if (haveProduct)
          return next(
            PopulateResponse.error(null, "Parent product category had product!")
          );

        validate.value.type = getCategory.type;
        validate.value.level = getCategory.level + 1;
      }
    }

    //check this product category has products yet
    const haveProduct = await DB.Product.findOne({
      categoryId: validate.value._id,
      isDeleted: false
    });
    if (haveProduct)
      return next(
        PopulateResponse.error(null, "This product category had product!")
      );

    //check category name is exist
    const existCategory = await DB.ProductCategory.find({
      name: { $regex: validate.value.name.toString(), $options: "i" },
      categoryId: { $ne: validate.value._id }
    });
    if (existCategory[0] !== undefined) {
      return next(
        PopulateResponse.error(null, "This product category name has existed!")
      );
    }

    if (!validate.value.parentId) {
      validate.value.parentId = null;
    }
    _.assign(req.productCategory, validate.value);

    await req.productCategory.save();
    res.locals.update = req.productCategory;
    return next();
  } catch (e) {
    return next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    // allow to delete if have no sub category and product
    const subChildCount = await DB.ProductCategory.countDocuments({
      parentId: req.productCategory._id,
      isDeleted: false
    });
    if (subChildCount) {
      return next(
        PopulateResponse.error(null, "Please delete sub categories first.")
      );
    }

    const haveProduct = await DB.Product.findOne({
      categoryId: req.productCategory._id,
      isDeleted: false
    });
    if (haveProduct)
      return next(
        PopulateResponse.error(
          null,
          "Cannot delete this category bacause it has some product!"
        )
      );

    req.productCategory.isDeleted = true;
    await req.productCategory.save();

    res.locals.remove = {
      message: "Đã Xóa Thể Loại Sản Phẩm Này"
    };
    return next();
  } catch (e) {
    return next(e);
  }
};

/**
 * get list productCategory
 */
exports.list = async (req, res, next) => {
  const page = Math.max(0, req.query.page - 1) || 0; // using a zero-based page index for use with skip()
  const take = parseInt(req.query.take, 10) || 10;

  try {
    const query = Helper.App.populateDbQuery(req.query, {
      text: ["name", "alias"]
    });
    query.isDeleted = false;

    const sort = Helper.App.populateDBSort(req.query);
    const count = await DB.ProductCategory.countDocuments(query);
    const items = await DB.ProductCategory.find(query)
      .populate({
        path: "mainImage",
        select: "_id filePath mediumPath thumbPath uploaded type"
      })
      .collation({ locale: "en" })
      .sort(sort)
      .skip(page * take)
      .limit(take)
      .exec();

    res.locals.productCategoryList = {
      count,
      items
    };
    next();
  } catch (e) {
    next(e);
  }
};

exports.tree = async (req, res, next) => {
  try {
    let categories;
    
    if (req.headers.platform === "admin") {
      const query = Helper.App.populateDbQuery(req.query, {
        boolean: ["isActive", "isPromotion"]
      });
      query.isDeleted = false;
      if(query.isPromotion === false){
        query.isPromotion = {'$in': [false, null]} 
      }
      categories = await DB.ProductCategory.find(query)
        .populate({
          path: "mainImage",
          select: "_id filePath mediumPath thumbPath uploaded type"
        })
        .sort({ ordering: -1 });
    } else {
      categories = await DB.ProductCategory.find({
        isDeleted: false,
        isActive: true,
        isPromotion: {'$in': [false, null]} 
      })
        .populate({
          path: "mainImage",
          select: "_id filePath mediumPath thumbPath uploaded type"
        })
        .sort({ ordering: -1 });
    }

    const tree = Helper.Utils.unflatten(categories.map(c => c.toJSON()));
    res.locals.tree = tree;
    next();
  } catch (e) {
    next(e);
  }
};

exports.categoryListByType = async (req, res, next) => {
  try {
    let query = Helper.App.populateDbQuery(req.params, {
      equal: ["type"]
    });

    if (req.params.type === "all") query = {};

    const categories = await DB.ProductCategory.find(query)
      .populate({
        path: "mainImage",
        select: "_id filePath mediumPath thumbPath uploaded type"
      })
      .sort({ ordering: -1 });

    const tree = Helper.Utils.unflatten(categories.map(c => c.toJSON()));
    res.locals.list = tree;
    next();
  } catch (e) {
    next(e);
  }
};
