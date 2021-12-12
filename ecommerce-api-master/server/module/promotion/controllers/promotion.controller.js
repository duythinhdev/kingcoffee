const Joi = require("@hapi/joi");
const _ = require('lodash');

const validateSchema = Joi.object().keys({
    promotionTypeId: Joi.string()
        .required()
        .messages({
            "string.base": '"promotionTypeId" bắt buộc phải là chuỗi ký tự',
            "string.empty": '"promotionTypeId" không được để trống',
            "any.required": 'Yêu cầu phải có "promotionTypeId"'
        }),
    promotionForm: Joi.string()
        .required()
        .messages({
            "string.base": '"promotionForm" bắt buộc phải là chuỗi ký tự',
            "string.empty": '"promotionForm" không được để trống',
            "any.required": 'Yêu cầu phải có "promotionForm"'
        }),
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
    content: Joi.string()
        .required()
        .messages({
            "string.base": '"content" bắt buộc phải là chuỗi ký tự',
            "string.empty": '"content" không được để trống',
            "any.required": 'Yêu cầu phải có "content"'
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
    timeApplyConditionType: Joi.string()
        .required()
        .messages({
            "string.base": '"timeApplyConditionType" bắt buộc phải là chuỗi ký tự',
            "string.empty": '"timeApplyConditionType" không được để trống',
            "any.required": 'Yêu cầu phải có "timeApplyConditionType"'
        }),
    timeApply: Joi.object().keys({
            moments: Joi.array()
                .required()
                .messages({
                    "array.base": '"applyTime - moments" bắt buộc phải là chuỗi ký tự',
                    "array.empty": '"applyTime - moments" không được để trống',
                    "any.required": 'Yêu cầu phải có "applyTime - moments"'
                }),
            momentStartDate: Joi.string()
                .required()
                .messages({
                    "string.base": '"applyTime - momentStartDate" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"applyTime - momentStartDate" không được để trống',
                    "any.required": 'Yêu cầu phải có "applyTime - momentStartDate"'
                }),
            momentEndDate: Joi.string()
                .required()
                .messages({
                    "string.base": '"applyTime - momentEndDate" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"applyTime - momentEndDate" không được để trống',
                    "any.required": 'Yêu cầu phải có "applyTime - momentEndDate"'
                }),
        })
        .allow(null)
        .allow("")
        .messages({
            "object.base": '"applyTime" bắt buộc phải là đối tượng',
        }),
    applyType: Joi.string()
        .required()
        .messages({
            "string.base": '"applyType" bắt buộc phải là chuỗi ký tự',
            "string.empty": '"applyType" không được để trống',
            "any.required": 'Yêu cầu phải có "applyType"'
        }),
    areaApply: Joi.array().items({
            id: Joi.number()
                .required()
                .messages({
                    "number.base": '"areaApply - id" bắt buộc phải là chuỗi ký tự',
                    "number.empty": '"areaApply - id" không được để trống',
                    "any.required": 'Yêu cầu phải có "areaApply - id"'
                }),
            name: Joi.string()
                .required()
                .messages({
                    "string.base": '"areaApply - name" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"areaApply - name" không được để trống',
                    "any.required": 'Yêu cầu phải có "areaApply - name"'
                }),
        })
        .required()
        .messages({
            "array.base": '"areaApply" bắt buộc phải là mảng',
            "array.empty": '"areaApply" không được để trống',
            "any.required": 'Yêu cầu phải có "areaApply"'
        }),
    applyRole: Joi.array().items({
            role: Joi.number()
                .required()
                .messages({
                    "number.base": '"applyRole - role" bắt buộc phải là số',
                    "number.empty": '"applyRole - role" không được để trống',
                    "any.required": 'Yêu cầu phải có "applyRole - role"'
                }),
            roleName: Joi.string()
                .required()
                .messages({
                    "string.base": '"applyRole - roleName" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"applyRole - roleName" không được để trống',
                    "any.required": 'Yêu cầu phải có "applyRole - roleName"'
                }),
            level: Joi.number()
                .required()
                .messages({
                    "number.base": '"applyRole - level" bắt buộc phải là số',
                    "number.empty": '"applyRole - level" không được để trống',
                    "any.required": 'Yêu cầu phải có "applyRole - level"'
                })
        })
        .required()
        .messages({
            "array.base": '"applyRole" bắt buộc phải là mảng',
            "array.empty": '"applyRole" không được để trống',
            "any.required": 'Yêu cầu phải có "applyRole"'
        }),
    isRejectApplyMemberId: Joi.boolean()
        .allow(null, '')
        .messages({
            "boolean.base": '"isRejectApplyMemberId" bắt buộc phải là kiểu logic',
        }),
    applyMemberId: Joi.array().items({
            memberId: Joi.string()
                .required()
                .messages({
                    "string.base": '"areaApply - id" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"areaApply - id" không được để trống',
                    "any.required": 'Yêu cầu phải có "areaApply - id"'
                }),
            memberName: Joi.string()
                .required()
                .messages({
                    "string.base": '"areaApply - id" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"areaApply - id" không được để trống',
                    "any.required": 'Yêu cầu phải có "areaApply - id"'
                }),
            phoneNumber: Joi.string()
                .required()
                .messages({
                    "string.base": '"areaApply - id" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"areaApply - id" không được để trống',
                    "any.required": 'Yêu cầu phải có "areaApply - id"'
                }),
        })
        .strict()
        .required()
        .messages({
            "array.base": '"applyMemberId" bắt buộc phải là mảng',
            "array.empty": '"applyMemberId" không được để trống',
            "any.required": 'Yêu cầu phải có "applyMemberId"'
        }),
    // policyApplyType: Joi.string()
    // .required()
    // .messages({
    //     "string.base": '"policyApplyType" bắt buộc phải là chuỗi ký tự',
    //     "string.empty": '"policyApplyType" không được để trống',
    //     "any.required": 'Yêu cầu phải có "policyApplyType"'
    // }),
    // maximumApplyNumber: Joi.number()
    // .allow("", null)
    // .messages({
    //     "string.base": '"maximumApplyNumber" bắt buộc phải là số',
    // }),
    // ordering: Joi.number()
    // .required()
    // .messages({
    //     "number.base": '"ordering" bắt buộc phải là số',
    //     "number.empty": '"ordering" không được để trống',
    //     "any.required": 'Yêu cầu phải có "ordering"'
    // }),
    // Khuyến mãi % đơn cho khách hàng mới.
    discountOrderForNewMember: Joi.object().keys({
            orderConditions: Joi.array().required().items({
                    // Giá trị sau chiết khẩu.
                    totalOrderPriceCondition: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"discountOrderForNewMember - orderConditions - id" bắt buộc phải là số',
                            "number.empty": '"discountOrderForNewMember - orderConditions - id" không được để trống',
                            "any.required": 'Yêu cầu phải có "discountOrderForNewMember - orderConditions - id"'
                        }),
                    // Đơn hàng thứ bao nhiêu.
                    orderNumber: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"discountOrderForNewMember - orderConditions - orderNumber" bắt buộc phải là số',
                            "number.empty": '"discountOrderForNewMember - orderConditions - orderNumber" không được để trống',
                            "any.required": 'Yêu cầu phải có "discountOrderForNewMember - orderConditions - orderNumber"'
                        }),
                    // Giá trị khuyến mãi.
                    discountPercent: Joi.number()
                        .allow(null, "")
                        .messages({
                            "string.base": '"discountOrderForNewMember - orderConditions - discountPercent" bắt buộc phải là số',
                        }),
                })
                .messages({
                    "array.base": '"discountOrderForNewMember - orderConditions" bắt buộc phải là mảng',
                    "array.empty": '"discountOrderForNewMember - orderConditions" không được để trống',
                    "any.required": 'Yêu cầu phải có "discountOrderForNewMember - orderConditions"'
                }),
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array()
                .required()
                .messages({
                    "array.base": '"discountOrderForNewMember - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"discountOrderForNewMember - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "discountOrderForNewMember - promotionProducts"'
                }),
        })
        .allow("", null)
        .messages({
            "object.base": '"discountOrderForNewMember" bắt buộc phải là đối tượng',
        }),
    //Tặng vật phẩm cho đơn khách hàng mới.
    giveSomeGiftForNewMember: Joi.object().keys({
            orderConditions: Joi.array()
                .allow(null, "").items({
                    // Giá trị sau chiết khẩu.
                    totalOrderPriceCondition: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"giveSomeGiftForNewMember - orderConditions - id" bắt buộc phải là số',
                            "number.empty": '"giveSomeGiftForNewMember - orderConditions - id" không được để trống',
                            "any.required": 'Yêu cầu phải có "giveSomeGiftForNewMember - orderConditions - id"'
                        }),
                    // Đơn hàng thứ bao nhiêu.
                    orderNumber: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"giveSomeGiftForNewMember - orderConditions - orderNumber" bắt buộc phải là số',
                            "number.empty": '"giveSomeGiftForNewMember - orderConditions - orderNumber" không được để trống',
                            "any.required": 'Yêu cầu phải có "giveSomeGiftForNewMember - orderConditions - orderNumber"'
                        }),
                })
                .messages({
                    "array.base": '"giveSomeGiftForNewMember - orderConditions" bắt buộc phải là mảng'
                }),
            giveGiftType: Joi.string()
                .required()
                .messages({
                    "string.base": '"giveSomeGiftForNewMember - giveGiftType" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"giveSomeGiftForNewMember - giveGiftType" không được để trống',
                    "any.required": 'Yêu cầu phải có "giveSomeGiftForNewMember - giveGiftType"'
                }),
            gifts: Joi.array()
                .items({
                    gift: Joi.string()
                        .required()
                        .messages({
                            "string.base": '"giveSomeGiftForNewMember - gifts - gift" bắt buộc phải là chuỗi ký tự',
                            "string.empty": '"giveSomeGiftForNewMember - gifts - gift" không được để trống',
                            "any.required": 'Yêu cầu phải có "giveSomeGiftForNewMember - gifts - gift"'
                        }),
                    quantity: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"giveSomeGiftForNewMember - gifts - quantity" bắt buộc phải là số',
                            "number.empty": '"giveSomeGiftForNewMember - gifts - quantity" không được để trống',
                            "any.required": 'Yêu cầu phải có "giveSomeGiftForNewMember - gifts - quantity"'
                        }),
                })
                .required()
                .messages({
                    "array.base": '"giveSomeGiftForNewMember - gifts" bắt buộc phải là mảng',
                    "array.empty": '"giveSomeGiftForNewMember - gifts" không được để trống',
                    "any.required": 'Yêu cầu phải có "giveSomeGiftForNewMember - gifts"'
                }),
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array()
                .required()
                .messages({
                    "array.base": '"giveSomeGiftForNewMember - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"giveSomeGiftForNewMember - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "giveSomeGiftForNewMember - promotionProducts"'
                }),
        })
        .allow("", null)
        .messages({
            "object.base": '"giveSomeGiftForNewMember" bắt buộc phải là đối tượng',
        }),
    //Khuyến mãi giỏ hàng tặng sản phẩm.
    checkoutDiscount: Joi.object().keys({
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array().items({
                    product: Joi.string()
                        .required()
                        .messages({
                            "string.base": '"checkoutDiscount - promotionProducts - product" bắt buộc phải là số',
                            "string.empty": '"checkoutDiscount - promotionProducts - product" không được để trống',
                            "any.required": 'Yêu cầu phải có "checkoutDiscount - promotionProducts - product"'
                        }),
                    quantity: Joi.number()
                        .allow(null)
                        .allow("")
                        .messages({
                            "number.base": '"checkoutDiscount - promotionProducts - quantity" bắt buộc phải là số',
                        }),
                })
                .required()
                .messages({
                    "array.base": '"checkoutDiscount - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"checkoutDiscount - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "checkoutDiscount - promotionProducts"'
                }),
            // Số lượng đặt mua
            orderQuantity: Joi.number()
                .allow(null)
                .allow("")
                .messages({
                    "number.base": '"checkoutDiscount - orderQuantity" bắt buộc phải là số',
                }),
            giveGiftType: Joi.string()
                .required()
                .messages({
                    "string.base": '"checkoutDiscount - giveGiftType" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"checkoutDiscount - giveGiftType" không được để trống',
                    "any.required": 'Yêu cầu phải có "checkoutDiscount - giveGiftType"'
                }),
            gifts: Joi.array()
                .items({
                    gift: Joi.string()
                        .required()
                        .messages({
                            "string.base": '"checkoutDiscount - gifts - gift" bắt buộc phải là chuỗi ký tự',
                            "string.empty": '"checkoutDiscount - gifts - gift" không được để trống',
                            "any.required": 'Yêu cầu phải có "checkoutDiscount - gifts - gift"'
                        }),
                    quantity: Joi.number()
                        .required()
                        .messages({
                            "string.base": '"checkoutDiscount - gifts - quantity" bắt buộc phải là số',
                            "string.empty": '"checkoutDiscount - gifts - quantity" không được để trống',
                            "any.required": 'Yêu cầu phải có "checkoutDiscount - gifts - quantity"'
                        }),
                })
                .required()
                .messages({
                    "array.base": '"checkoutDiscount - gifts" bắt buộc phải là mảng',
                    "array.empty": '"checkoutDiscount - gifts" không được để trống',
                    "any.required": 'Yêu cầu phải có "checkoutDiscount - gifts"'
                }),
        })
        .allow(null, "")
        .messages({
            "array.base": '"checkoutDiscount" bắt buộc phải là đối tượng'
        }),
    //Khuyến mãi sản phẩm theo số lượng.
    discountOrderFollowProductQuantity: Joi.object().keys({
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array()
                .required()
                .messages({
                    "array.base": '"discountOrderFollowProductQuantity - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"discountOrderFollowProductQuantity - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "discountOrderFollowProductQuantity - promotionProducts"'
                }),
            // Số lượng đặt mua
            orderQuantity: Joi.number()
                .required()
                .messages({
                    "number.base": '"discountOrderFollowProductQuantity - orderQuantity" bắt buộc phải là số',
                    "number.empty": '"discountOrderFollowProductQuantity - orderQuantity" không được để trống',
                    "any.required": 'Yêu cầu phải có "discountOrderFollowProductQuantity - orderQuantity"'
                }),
            // Phần trăm khuyến mãi
            discountPercent: Joi.number()
                .allow(null, "")
                .messages({
                    "number.base": '"discountOrderFollowProductQuantity - discountPercent" bắt buộc phải là số',
                }),
        })
        .allow(null, "")
        .messages({
            "array.base": '"discountOrderFollowProductQuantity" bắt buộc phải là đối tượng'
        }),
    //Giảm giá sản phẩm
    productDiscount: Joi.array().items({
            //Sản phẩm khuyến mãi
            productId: Joi.string()
                .required()
                .messages({
                    "string.base": '"productDiscount - productId" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"productDiscount - productId" không được để trống',
                    "any.required": 'Yêu cầu phải có "productDiscount - productId"'
                }),
            //Phần trăm khuyến mãi
            discountPercent: Joi.number()
                .required()
                .messages({
                    "number.base": '"productDiscount - discountPercent" bắt buộc phải là số',
                    "number.empty": '"productDiscount - discountPercent" không được để trống',
                    "any.required": 'Yêu cầu phải có "productDiscount - discountPercent"'
                }),
        })
        .allow(null).allow('')
        .messages({
            "array.base": '"productDiscount" bắt buộc phải là mảng'
        }),
    //Khuyến mãi đơn mua sp ưu đãi
    buyGoodPriceProduct: Joi.object().keys({
            // Giá trị sau chiết khẩu của đơn hàng.
            totalOrderPriceCondition: Joi.number()
                .required()
                .messages({
                    "number.base": '"buyGoodPriceProduct - totalOrderPriceCondition" bắt buộc phải là số',
                    "number.empty": '"buyGoodPriceProduct - totalOrderPriceCondition" không được để trống',
                    "any.required": 'Yêu cầu phải có "buyGoodPriceProduct - totalOrderPriceCondition"'
                }),
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array()
                .required()
                .messages({
                    "array.base": '"buyGoodPriceProduct - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"buyGoodPriceProduct - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "buyGoodPriceProduct - promotionProducts"'
                }),
            // Danh sách sản phẩm ưu đãi
            goodPriceProducts: Joi.array().items({
                    //Sản phẩm khuyến mãi
                    product: Joi.string()
                        .required()
                        .messages({
                            "number.base": '"buyGoodPriceProduct - product" bắt buộc phải là chuỗi ký tự',
                            "number.empty": '"buyGoodPriceProduct - product" không được để trống',
                            "any.required": 'Yêu cầu phải có "buyGoodPriceProduct - product"'
                        }),
                    //Phần trăm mua sản phẩm ưu đãi
                    discountOnProductPercent: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"buyGoodPriceProduct - discountOnProductPercent" bắt buộc phải là số',
                            "number.empty": '"buyGoodPriceProduct - discountOnProductPercent" không được để trống',
                            "any.required": 'Yêu cầu phải có "buyGoodPriceProduct - discountOnProductPercent"'
                        }),
                })
                .required()
                .messages({
                    "array.base": '"buyGoodPriceProduct - goodPriceProducts" bắt buộc phải là mảng',
                    "array.empty": '"buyGoodPriceProduct - goodPriceProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "buyGoodPriceProduct - goodPriceProducts"'
                }),
        })
        .allow(null, "")
        .messages({
            "array.base": '"buyGoodPriceProduct" bắt buộc phải là đối tượng'
        }),
    // Khuyến mãi % đơn hoặc tiền
    orderDiscount: Joi.object().keys({
            // Giá trị sau chiết khẩu của đơn hàng.
            totalOrderPriceCondition: Joi.number()
                .required()
                .messages({
                    "number.base": '"orderDiscount - totalOrderPriceCondition" bắt buộc phải là số',
                    "number.empty": '"orderDiscount - totalOrderPriceCondition" không được để trống',
                    "any.required": 'Yêu cầu phải có "orderDiscount - totalOrderPriceCondition"'
                }),
            //Loại giảm giá (% hoặc tiền)
            discountType: Joi.string()
                .required()
                .messages({
                    "string.base": '"orderDiscount - discountType" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"orderDiscount - discountType" không được để trống',
                    "any.required": 'Yêu cầu phải có "orderDiscount - discountType"'
                }),
            //Phần trăm hoặc tiền chiết khấu trên đơn hàng
            discountOrderValue: Joi.number()
                .required()
                .messages({
                    "number.base": '"orderDiscount - discountOrderValue" bắt buộc phải là số',
                    "number.empty": '"orderDiscount - discountOrderValue" không được để trống',
                    "any.required": 'Yêu cầu phải có "orderDiscount - discountOrderValue"'
                }),
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array()
                .required()
                .messages({
                    "array.base": '"orderDiscount - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"orderDiscount - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "orderDiscount - promotionProducts"'
                }),
        })
        .allow(null, "")
        .messages({
            "array.base": '"orderDiscount" bắt buộc phải là đối tượng'
        }),
    // Khuyến mãi giỏ hàng tặng % hoặc tiền
    checkoutPercentOrMoneyDiscount: Joi.object().keys({
            // Số lượng đặt mua
            orderQuantity: Joi.number()
                .allow(null)
                .allow("")
                .messages({
                    "number.base": '"checkoutPercentOrMoneyDiscount - orderQuantity" bắt buộc phải là số',
                }),
            //Loại giảm giá (% hoặc tiền)
            discountType: Joi.string()
                .required()
                .messages({
                    "string.base": '"checkoutPercentOrMoneyDiscount - discountType" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"checkoutPercentOrMoneyDiscount - discountType" không được để trống',
                    "any.required": 'Yêu cầu phải có "checkoutPercentOrMoneyDiscount - discountType"'
                }),
            //Phần trăm hoặc tiền chiết khấu trên đơn hàng
            discountOrderValue: Joi.number()
                .required()
                .messages({
                    "number.base": '"checkoutPercentOrMoneyDiscount - discountOrderValue" bắt buộc phải là số',
                    "number.empty": '"checkoutPercentOrMoneyDiscount - discountOrderValue" không được để trống',
                    "any.required": 'Yêu cầu phải có "checkoutPercentOrMoneyDiscount - discountOrderValue"'
                }),
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array().items({
                    product: Joi.string()
                        .required()
                        .messages({
                            "string.base": '"checkoutPercentOrMoneyDiscount - promotionProducts - product" bắt buộc phải là số',
                            "string.empty": '"checkoutPercentOrMoneyDiscount - promotionProducts - product" không được để trống',
                            "any.required": 'Yêu cầu phải có "checkoutPercentOrMoneyDiscount - promotionProducts - product"'
                        }),
                    quantity: Joi.number()
                        .allow(null)
                        .allow("")
                        .messages({
                            "number.base": '"checkoutPercentOrMoneyDiscount - promotionProducts - quantity" bắt buộc phải là số',
                        }),
                })
                .required()
                .messages({
                    "array.base": '"checkoutPercentOrMoneyDiscount - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"checkoutPercentOrMoneyDiscount - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "checkoutPercentOrMoneyDiscount - promotionProducts"'
                }),
        })
        .allow(null, "")
        .messages({
            "array.base": '"checkoutPercentOrMoneyDiscount" bắt buộc phải là đối tượng'
        }),
    // Miễn phí giao hàng - freeship
    freeShip: Joi.object().keys({
            // Giá trị sau chiết khẩu của đơn hàng.
            totalOrderPriceCondition: Joi.number()
                .required()
                .messages({
                    "number.base": '"freeShip - totalOrderPriceCondition" bắt buộc phải là số',
                    "number.empty": '"freeShip - totalOrderPriceCondition" không được để trống',
                    "any.required": 'Yêu cầu phải có "freeShip - totalOrderPriceCondition"'
                }),
            // Giảm giá phí ship.
            shippingPriceDiscount: Joi.number()
                .required()
                .messages({
                    "number.base": '"freeShip - shippingPriceDiscount" bắt buộc phải là số',
                    "number.empty": '"freeShip - shippingPriceDiscount" không được để trống',
                    "any.required": 'Yêu cầu phải có "freeShip - shippingPriceDiscount"'
                }),
            // Hình thức áp dụng
            applyType: Joi.string()
                .required()
                .messages({
                    "string.base": '"freeShip - applyType" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"freeShip - applyType" không được để trống',
                    "any.required": 'Yêu cầu phải có "freeShip - applyType"'
                }),
            // Thời gian mã code giảm giá ship có thể được áp dụng
            applyStartDate: Joi.string()
                .allow(null)
                .allow("")
                .messages({
                    "string.base": '"freeShip - applyStartDate" bắt buộc phải là chuỗi ký tự',
                }),
            applyEndDate: Joi.string()
                .allow(null)
                .allow("")
                .messages({
                    "string.base": '"freeShip - applyEndDate" bắt buộc phải là chuỗi ký tự',
                }),
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array()
                .required()
                .messages({
                    "array.base": '"freeShip - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"freeShip - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "freeShip - promotionProducts"'
                }),
        })
        .allow(null)
        .allow("")
        .messages({
            "array.base": '"freeShip" bắt buộc phải là đối tượng'
        }),
    // Tặng sp cho đơn.
    giveGiftForOrder: Joi.object().keys({
            // Giá trị sau chiết khẩu của đơn hàng.
            totalOrderPriceCondition: Joi.number()
                .required()
                .messages({
                    "number.base": '"giveGiftForOrder - totalOrderPriceCondition" bắt buộc phải là số',
                    "number.empty": '"giveGiftForOrder - totalOrderPriceCondition" không được để trống',
                    "any.required": 'Yêu cầu phải có "giveGiftForOrder - totalOrderPriceCondition"'
                }),
            // Loại điều kiện so sánh với tổng giá đơn hàng.
            totalOrderPriceConditionType: Joi.string()
                .allow(null, "")
                .valid("equal", "greaterThenOrEqual", "lessThenOrEqual")
                .messages({
                    "string.base": '"giveGiftForOrder - totalOrderPriceConditionType" bắt buộc phải là ký tự',
                }),
            // Danh sách sản phẩm khuyến mãi.
            promotionProducts: Joi.array()
                .required()
                .messages({
                    "array.base": '"giveGiftForOrder - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"giveGiftForOrder - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "giveGiftForOrder - promotionProducts"'
                }),
            // Loại hình tặng sản phẩm.
            giveGiftType: Joi.string()
                .required()
                .messages({
                    "string.base": '"giveGiftForOrder - giveGiftType" bắt buộc phải là chuỗi ký tự',
                    "string.empty": '"giveGiftForOrder - giveGiftType" không được để trống',
                    "any.required": 'Yêu cầu phải có "giveGiftForOrder - giveGiftType"'
                }),
            // Danh sách sản phẩm tặng.
            gifts: Joi.array()
                .items({
                    // Sản phẩm tặng kèm.
                    gift: Joi.string()
                        .required()
                        .messages({
                            "string.base": '"giveGiftForOrder - gifts - gift" bắt buộc phải là chuỗi ký tự',
                            "string.empty": '"giveGiftForOrder - gifts - gift" không được để trống',
                            "any.required": 'Yêu cầu phải có "giveGiftForOrder - gifts - gift"'
                        }),
                    // Số lượng tặng.
                    quantity: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"giveGiftForOrder - gifts - quantity" bắt buộc phải là số',
                            "number.empty": '"giveGiftForOrder - gifts - quantity" không được để trống',
                            "any.required": 'Yêu cầu phải có "giveGiftForOrder - gifts - quantity"'
                        }),
                    // Số lượng tặng.
                    quantity: Joi.number()
                        .required()
                        .messages({
                            "number.base": '"giveGiftForOrder - gifts - quantity" bắt buộc phải là số',
                            "number.empty": '"giveGiftForOrder - gifts - quantity" không được để trống',
                            "any.required": 'Yêu cầu phải có "giveGiftForOrder - gifts - quantity"'
                        }),
                    maximumQuantity: Joi.number()
                        .allow(null, "")
                        .messages({
                            "number.base": '"giveGiftForOrder - gifts - maximumQuantity" bắt buộc phải là số',
                        }),
                })
                .required()
                .messages({
                    "array.base": '"giveGiftForOrder - gifts" bắt buộc phải là mảng',
                    "array.empty": '"giveGiftForOrder - gifts" không được để trống',
                    "any.required": 'Yêu cầu phải có "giveGiftForOrder - gifts"'
                }),
            // Tổng quà tối đa có thể tặng
            maximumTotalGift: Joi.number()
                .allow(null, "")
                .messages({
                    "string.base": '"giveGiftForOrder - maximumTotalGift" bắt buộc phải là chuỗi ký tự',
                }),
            // Tổng quà tối đa có thể tặng cho mỗi user
            maximumTotalGiftPerUser: Joi.number()
                .allow(null, "")
                .messages({
                    "string.base": '"giveGiftForOrder - maximumTotalGiftPerUser" bắt buộc phải là chuỗi ký tự',
                }),
        })
        .allow(null)
        .allow("")
        .messages({
            "array.base": '"giveGiftForOrder" bắt buộc phải là đối tượng'
        }),
    // Khuyến mãi sản phẩm tặng sản phẩm
    bonusProducts: Joi.object().keys({
            // Giá trị sau chiết khẩu của đơn hàng.
            totalOrderPriceCondition: Joi.number()
                .allow(null, "")
                .messages({
                    "number.base": '"bonusProducts - totalOrderPriceCondition" bắt buộc phải là số',
                }),
            // Loại điều kiện so sánh với tổng giá đơn hàng.
            totalOrderPriceConditionType: Joi.string()
                .allow(null, "")
                .valid("equal", "greaterThenOrEqual", "lessThenOrEqual")
                .messages({
                    "string.base": '"bonusProducts - totalOrderPriceConditionType" bắt buộc phải là ký tự',
                }),
            // Số lượng đặt mua
            orderQuantity: Joi.number()
                .required()
                .messages({
                    "number.base": '"bonusProducts - orderQuantity" bắt buộc phải là số',
                    "array.empty": '"bonusProducts - orderQuantity" không được để trống',
                    "any.required": 'Yêu cầu phải có "bonusProducts - orderQuantity"'
                }),
            // Số lượng sản phẩm tặng thêm
            bonusQuantity: Joi.number()
                .required()
                .messages({
                    "number.base": '"bonusProducts - bonusQuantity" bắt buộc phải là số',
                    "array.empty": '"bonusProducts - bonusQuantity" không được để trống',
                    "any.required": 'Yêu cầu phải có "bonusProducts - bonusQuantity"'
                }),
            // Danh sách sản phẩm khuyến mãi
            promotionProducts: Joi.array().items({
                    product: Joi.string()
                        .required()
                        .messages({
                            "string.base": '"bonusProducts - promotionProducts - product" bắt buộc phải là số',
                            "string.empty": '"bonusProducts - promotionProducts - product" không được để trống',
                            "any.required": 'Yêu cầu phải có "bonusProducts - promotionProducts - product"'
                        }),
                    bonusProduct: Joi.string()
                        .required()
                        .messages({
                            "string.base": '"bonusProducts - promotionProducts - bonusProduct" bắt buộc phải là số',
                        }),
                })
                .required()
                .messages({
                    "array.base": '"bonusProducts - promotionProducts" bắt buộc phải là mảng',
                    "array.empty": '"bonusProducts - promotionProducts" không được để trống',
                    "any.required": 'Yêu cầu phải có "bonusProducts - promotionProducts"'
                }),
            // Tổng quà tối đa có thể tặng
            maximumTotalGift: Joi.number()
                .allow(null, "")
                .messages({
                    "string.base": '"giveGiftForOrder - maximumTotalGift" bắt buộc phải là chuỗi ký tự',
                }),
            // Tổng quà tối đa có thể tặng cho mỗi user
            maximumTotalGiftPerUser: Joi.number()
                .allow(null, "")
                .messages({
                    "string.base": '"giveGiftForOrder - maximumTotalGiftPerUser" bắt buộc phải là chuỗi ký tự',
                }),
        })
        .allow(null, "")
        .messages({
            "array.base": '"bonusProducts" bắt buộc phải là đối tượng'
        }),
    hubReceiveNoticeDate: Joi.string()
        .allow(null, "")
        .messages({
            "string.base": '"hubReceiveNoticeDate" bắt buộc phải là chuỗi ký tự',
        }),
    isActive: Joi.boolean()
        .required()
        .messages({
            "boolean.base": '"isActive" bắt buộc phải là kiểu logic',
            "boolean.empty": '"isActive" không được để trống',
            "any.required": 'Yêu cầu phải có "isActive"'
        }),
});

const getListValidateSchema = Joi.object().keys({
    code: Joi.string()
        .allow(null, "")
        .messages({
            "string.base": '"name" bắt buộc phải là chuỗi ký tự',
        }),
    promotionForm: Joi.string()
        .allow(null, "")
        .messages({
            "string.base": '"promotionForm" bắt buộc phải là chuỗi ký tự',
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

exports.list = async(req, res, next) => {
    try {
        const validate = getListValidateSchema.validate(req.query);
        if (validate.error) {
            return next(PopulateResponse.validationError(validate.error));
        }

        //call get list promotion (paging server side)
        const list = await Service.Promotion.list(validate.value);
        res.locals.data = list;

        return next();
    } catch (e) {
        return next(e);
    }
}

exports.findById = async(req, res, next) => {
    try {
        if (req.params.id) {
            //call update promotion type in promotion type service
            const promotionType = await Service.Promotion.findOne(req.params);
            res.locals.data = promotionType;
        } else {
            return next(new Error("Promotion id is required!"));
        }

        return next();
    } catch (e) {
        return next(e);
    }
}

exports.create = async(req, res, next) => {
    try {
        const validate = validateSchema.validate(req.body);
        if (validate.error) {
            return next(PopulateResponse.validationError(validate.error));
        }

        //call create promotion type in promotion service
        await Service.Promotion.create(req.body);

        return next();
    } catch (e) {
        return next(e);
    }
}


exports.update = async(req, res, next) => {
    try {
        const validate = validateSchema.validate(req.body);
        if (validate.error) {
            return next(PopulateResponse.validationError(validate.error));
        }

        if (req.params.id) {
            //call update promotion type in promotion type service
            const promotionType = await Service.Promotion.update(_.assign({
                id: req.params.id
            }, validate.value));
            res.locals.data = promotionType;
        } else {
            return next(new Error(PopulateResponse.notFound()));
        }

        return next();
    } catch (e) {
        return next(e);
    }
}

exports.remove = async(req, res, next) => {
    try {
        if (req.params.id) {
            //call remove promotion type in promotion type service
            const list = await Service.Promotion.remove(req.params);
        } else {
            return next(new Error("Promotion id is required!"));
        }

        return next();
    } catch (e) {
        return next(e);
    }
}

exports.listPromotionForUser = async(req, res, next) => {
    try {
        const list = await Service.Promotion.listPromotionForUser(req.query, req.user);
        res.locals.data = list;
        return next();
    } catch (e) {
        return next(e);
    }
}

exports.getPromotionProductsOrderBy_PromotionType = async(req, res, next) => {
    try {
        const list = await Service.Promotion.getPromotionProductsOrderBy_PromotionType(req.query, req.user);
        res.locals.data = list;
        return next();
    } catch (e) {
        return next(e);
    }
}

exports.stopPromotion = async(req, res, next) => {
    try {
        if (req.params.id) {
            await Service.Promotion.stopPromotion(req.params.id);
            return next();
        } else {
            return next(new Error("Promotion id is required!"));
        }
    } catch (e) {
        return next(e);
    }
}

exports.checkCodePromotionFreeShip = async(req, res, next) => {
    try {
        const result = await Service.FreeShip.checkCodePromotionFreeShip(req.body.code, req.user || {});
        if (result) {
            res.locals.data = true
            return next(PopulateResponse.success(result, "Check code Free ship invalid!"));
        } else {
            return next(new Error("Promotion Free ship not found!"));
        }
    } catch (e) {
        return next(e);
    }
}