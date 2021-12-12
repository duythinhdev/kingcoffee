const Joi = require("@hapi/joi");

exports.calculate = async (req, res, next) => {
    try {
        const validateSchema = Joi.object().keys({
            products: Joi.array()
                .items(
                    Joi.object()
                        .keys({
                            productId: Joi.string().required().messages({
                                'string.base': `"productId" bắt buộc phải là những ký tự`,
                                'string.empty': `"productId" không được để trống`,
                                'any.required': `Yêu cầu phải có "products"`
                            }),
                            productVariantId: Joi.string()
                                .allow(null, "")
                                .optional()
                                .messages({
                                    'string.base': `"productVariantId" bắt buộc phải là những ký tự`
                                }),
                            quantity: Joi.number()
                                .greater(0)
                                .optional()
                                .messages({
                                    'number.base': `"quantity" bắt buộc phải là 1 số`,
                                    'number.empty': `"quantity" không được để trống`
                                }),
                            couponCode: Joi.string()
                                .allow(null, "")
                                .optional()
                                .messages({
                                    'string.base': `"couponCode" bắt buộc phải là những ký tự`,
                                })
                        })
                        .unknown()
                )
                .required().messages({
                    'array.base': `"products" bắt buộc phải là 1 mảng`,
                    'array.empty': `"products" không được để trống`,
                    'any.required': `Yêu cầu phải có "products"`
                }),
            // TODO - update me
            shippingMethod: Joi.string()
                .allow("cod")
                .optional()
                .default("cod")
                .messages({
                    'string.base': `"shippingMethod" bắt buộc phải là những ký tự`,
                    'string.empty': `"shippingMethod" không được để trống`
                }),
            shippingAddress: Joi.string()
                .allow(null, "")
                .optional()
                .messages({
                    'string.base': `"shippingAddress" bắt buộc phải là những ký tự`,
                    'string.empty': `"shippingAddress" không được để trống`
                }),
            paymentMethod: Joi.string()
                .allow("cod")
                .optional()
                .default("cod")
                .messages({
                    'string.base': `"paymentMethod" bắt buộc phải là những ký tự`,
                    'string.empty': `"paymentMethod" không được để trống`
                }),
            userCurrency: Joi.string().optional().messages({
                'string.base': `"userCurrency" bắt buộc phải là những ký tự`,
                'string.empty': `"userCurrency" không được để trống`
            }),
        });

        const validate = validateSchema.validate(req.body);
        if (validate.error) {
            return next(PopulateResponse.validationError(validate.error));
        }
        res.locals.calculate = await Service.Cart.calculate(validate.value, req.user || {});

        return next();
    } catch (e) {
        return next(e);
    }
};

exports.calculateShippingPrice = async (req, res, next) => {
    try {
        const validateSchema = Joi.object().keys({
            products: Joi.array().items(
                Joi.object()
                    .keys({
                        productId: Joi.string().required().messages({
                            'string.base': `"productId" bắt buộc phải là những ký tự`,
                            'string.empty': `"productId" không được để trống`,
                            'any.required': `Yêu cầu phải có "products"`
                        }),
                        quantity: Joi.number()
                            .greater(0)
                            .required()
                            .messages({
                                'number.base': `"quantity" bắt buộc phải là 1 số`,
                                'number.empty': `"quantity" không được để trống`,
                                'any.required': `Yêu cầu phải có "quantity"`
                            }),
                    })
                    .unknown()
            )
                .required().messages({
                    'array.base': `"products" bắt buộc phải là 1 mảng`,
                    'array.empty': `"products" không được để trống`,
                    'any.required': `Yêu cầu phải có "products"`
                }),
            shippingMethod: Joi.string()
                .allow("cod")
                .optional()
                .default("cod")
                .messages({
                    'string.base': `"shippingMethod" bắt buộc phải là những ký tự`,
                    'string.empty': `"shippingMethod" không được để trống`
                }),
            shippingAddress: Joi.string()
                .allow(null, "")
                .optional()
                .messages({
                    'string.base': `"shippingAddress" bắt buộc phải là những ký tự`
                }),
            paymentMethod: Joi.string()
                .allow("cod")
                .optional()
                .default("cod")
                .messages({
                    'string.base': `"paymentMethod" bắt buộc phải là những ký tự`,
                    'string.empty': `"paymentMethod" không được để trống`
                }),
            email: Joi.string()
                .allow(null, "")
                .optional()
                .messages({
                    'string.base': `"email" bắt buộc phải có dạng 'example@gmail.com'`
                }),
            phoneNumber: Joi.string()
                .required()
                .messages({
                    'string.base': `"phoneNumber" bắt buộc phải là những ký tự`,
                    'string.empty': `"phoneNumber" không được để trống`,
                    'any.required': `Yêu cầu phải có "phoneNumber"`
                }),
            firstName: Joi.string()
                .required()
                .messages({
                    'string.base': `"firstName" bắt buộc phải là những ký tự`,
                    'string.empty': `"firstName" không được để trống`,
                    'any.required': `Yêu cầu phải có "firstName"`
                }),
            lastName: Joi.string()
                .required()
                .messages({
                    'string.base': `"lastName" bắt buộc phải là những ký tự`,
                    'string.empty': `"lastName" không được để trống`,
                    'any.required': `Yêu cầu phải có "lastName"`
                }),
            streetAddress: Joi.string()
                .required()
                .messages({
                    'string.base': `"streetAddress" bắt buộc phải là những ký tự`,
                    'string.empty': `"streetAddress" không được để trống`,
                    'any.required': `Yêu cầu phải có "streetAddress"`
                }),
            city: Joi.string()
                .required()
                .messages({
                    'string.base': `"city" bắt buộc phải là những ký tự`,
                    'string.empty': `"city" không được để trống`,
                    'any.required': `Yêu cầu phải có "city"`
                }),
            district: Joi.string()
                .required()
                .messages({
                    'string.base': `"district" bắt buộc phải là những ký tự`,
                    'string.empty': `"district" không được để trống`,
                    'any.required': `Yêu cầu phải có "district"`
                }),
            ward: Joi.string()
                .required()
                .messages({
                    'string.base': `"ward" bắt buộc phải là những ký tự`,
                    'string.empty': `"ward" không được để trống`,
                    'any.required': `Yêu cầu phải có "ward"`
                }),
            zipCode: Joi.string()
                .required()
                .messages({
                    'string.base': `"zipCode" bắt buộc phải là những ký tự`,
                    'string.empty': `"zipCode" không được để trống`,
                    'any.required': `Yêu cầu phải có "zipCode"`
                }),
        })

        const validate = validateSchema.validate(req.body);
        if (validate.error) {
            return next(PopulateResponse.validationError(validate.error));
        }
        res.locals.calculate = await Service.Cart.calculateShippingPrice(validate.value);

        return next();
    } catch (error) {
        return next(error);
    }
}
