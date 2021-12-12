const { allow } = require("@hapi/joi");
const Joi = require("@hapi/joi");
const _ = require('lodash');

const validateSchema = Joi.object().keys({
    code: Joi.string()
    .required()
    .messages({
        "string.base": '"code" bắt buộc phải là chuỗi ký tự',
        "string.empty": '"code" không được để trống',
        "any.required": 'Yêu cầu phải có "code"'
    }),
    name: Joi.string()
    .required()
    .messages({
        "string.base": '"name" bắt buộc phải là chuỗi ký tự',
        "string.empty": '"name" không được để trống',
        "any.required": 'Yêu cầu phải có "name"'
    }),
    description: Joi.string()
    .allow("", null)
    .messages({
        "string.base": '"description" bắt buộc phải là chuỗi ký tự',
    }),
    startDate: Joi.string()
    .required()
    .messages({
        "string.base": '"startDate" bắt buộc phải là chuỗi ký tự',
        "string.empty": '"startDate" không được để trống',
        "any.required": 'Yêu cầu phải có "startDate"'
    }),
    endDate: Joi.string()
    .required()
    .messages({
        "string.base": '"endDate" bắt buộc phải là chuỗi ký tự',
        "string.empty": '"endDate" không được để trống',
        "any.required": 'Yêu cầu phải có "endDate"'
    }),
    isActive: Joi.boolean()
    .allow("", null)
    .messages({
        "boolean.base": '"isActive" bắt buộc phải là kiểu logic',
    }),
    // ordering: Joi.number()
    // .allow("", null)
    // .messages({
    //     "number.base": '"ordering" bắt buộc phải là chữ số',
    // }),
    // isPriority: Joi.boolean()
    // .allow("", null)
    // .messages({
    //     "boolean.base": '"isPriority" bắt buộc phải là kiểu logic',
    // }),
    isStop: Joi.boolean()
    .allow("", null)
    .messages({
        "boolean.base": '"isStop" bắt buộc phải là kiểu logic',
    }),
    isDisplayHomePage: Joi.boolean()
    .allow("", null)
    .messages({
        "boolean.base": '"isDisplayHomePage" bắt buộc phải là kiểu logic',
    }),
});

const getListValidateSchema = Joi.object().keys({
    code: Joi.string()
    .allow(null, "")
    .messages({
        "string.base": '"name" bắt buộc phải là chuỗi ký tự',
    }),
    startDate: Joi.string()
    .allow(null, "")
    .messages({
        "string.base": '"startDate" bắt buộc phải là chuỗi ký tự',
    }),
    endDate: Joi.string()
    .allow(null, "")
    .messages({
        "string.base": '"endDate" bắt buộc phải là chuỗi ký tự',
    }),
    isActive: Joi.boolean()
    .allow(null, "")
    .messages({
        "boolean.base": '"isActive" bắt buộc phải là kiểu logic',
    }),
    sort: Joi.string()
    .allow(null, "")
    .messages({
        "string.base": '"sort" bắt buộc phải là chuỗi ký tự',
    }),
    sortType: Joi.string()
    .allow(null, "")
    .messages({
        "string.base": '"sortType" bắt buộc phải là chuỗi ký tự',
    }),
    page: Joi.number()
    .allow(null, "")
    .messages({
        "number.base": '"page" bắt buộc phải là số',
    }),
    take: Joi.number()
    .allow(null, "")
    .messages({
        "number.base": '"take" bắt buộc phải là số',
    }),
});

exports.list = async (req, res, next) => {
    try{      
        const validate = getListValidateSchema.validate(req.query);
        if (validate.error) {
          return next(PopulateResponse.validationError(validate.error));
        }

        //call get list promotion (paging server side)
        const list = await Service.PromotionType.list(validate.value);
        res.locals.data = list;

        return next();
    }catch(e){
        return next(e);
    }
}

exports.findById = async (req, res, next) => {
    try{
        if(req.params.id){
            //call update promotion type in promotion type service
            const promotionType = await Service.PromotionType.findOne(req.params);
            res.locals.data = promotionType;
        }else{
            return next(new Error("Promotion type id is required!"));
        }
        
        return next();
    }catch(e){
        return next(e);
    }
}

exports.create = async (req, res, next) => {
    try{
        const validate = validateSchema.validate(req.body);
        if (validate.error) {
          return next(PopulateResponse.validationError(validate.error));
        }

        //call create promotion type in promotion type service
        await Service.PromotionType.create(req.body);
        
        return next();
    }catch(e){
        return next(e);
    }
}


exports.update = async (req, res, next) => {
    try{
        const validate = validateSchema.validate(req.body);
        if (validate.error) {
          return next(PopulateResponse.validationError(validate.error));
        }

        if(req.params.id){
            //call update promotion type in promotion type service
            const promotionType = await Service.PromotionType.update(_.assign({id: req.params.id}, validate.value));
            res.locals.data = promotionType;
        }else{
            return next(new Error(PopulateResponse.notFound()));
        }
        
        return next();
    }catch(e){
        return next(e);
    }
}

exports.remove = async (req, res, next) => {
    try{
        if(req.params.id){
            //call remove promotion type in promotion type service
            const list = await Service.PromotionType.remove(req.params);
        }else{
            return next(new Error("Promotion type id is required!"));
        }
       
        return next();
    }catch(e){
        return next(e);
    }
}

exports.stop = async(req, res, next) => {
    try{
        if(req.params.id){
            await Service.PromotionType.stopPromotionType(req.params.id);
            return next();
        }else{
            //throw new Error("promotion type ID is invalid!");
            return next(new Error("ID loại chương trình khuyến mãi không hợp lệ!"));
        }
    }catch(e){  
        return next(new Error(e.message));
    }
}