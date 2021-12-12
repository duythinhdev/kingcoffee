const Joi = require('@hapi/joi');
const moment = require('moment');
const _ = require('lodash');
const {
    order
} = require('paypal-rest-sdk');
const {
    isEmpty
} = require('lodash');

const redis = require('redis');
const portRedis = process.env.REDIS_PORT || 6379;
const hostRedis = process.env.REDIS_HOST || '127.0.0.1';
const redisClient = redis.createClient(portRedis, hostRedis);
const redisKeyGetPromotionByPromotionType = 'getProductDetailPromotions';
const expire = 60 * 60 * 2; // 2 hours
/**
 * Get promotionType object.
 */
exports.findOne = async(options) => {
    try {
        const promotion = await DB.Promotion.findById(options.id)
            .populate("promotionType")
            // Khuyến mãi % đơn cho khách hàng mới.
            .populate({
                path: "discountOrderForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Tặng vật phẩm cho đơn khách hàng mới.
            .populate({
                path: "giveSomeGiftForNewMember.gifts.gift",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveSomeGiftForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi giỏ hàng tặng sản phẩm.
            .populate({
                path: "checkoutDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "checkoutDiscount.gifts.gift",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi sản phẩm theo số lượng.
            .populate({
                path: "discountOrderFollowProductQuantity.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Giảm giá sản phẩm
            .populate({
                path: "productDiscount.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi đơn mua sp ưu đãi
            .populate({
                path: "buyGoodPriceProduct.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "buyGoodPriceProduct.goodPriceProducts.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi % đơn hoặc tiền
            .populate({
                path: "orderDiscount.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi giỏ hàng tặng % hoặc tiền
            .populate({
                path: "checkoutPercentOrMoneyDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            // Miễn phí giao hàng - freeship
            .populate({
                path: "freeShip.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Tặng sp cho đơn
            .populate({
                path: "giveGiftForOrder.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveGiftForOrder.gifts.gift",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi sản phẩm tặng sản phẩm
            .populate({
                path: "bonusProducts.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "bonusProducts.promotionProducts.bonusProduct",
                populate: ["mainImage", "category"]
            })
            .exec();

        if (!promotion) {
            return new Error(PopulateResponse.notFound());
        }

        //Cập nhật trạng thái cho các promotion được filter
        await this.updatePromotionStatus({
            query: {
                _id: promotion._id
            }
        });

        return promotion;
    } catch (e) {
        throw e;
    }
}


/**
 * Create a new promotion.
 */
exports.create = async(options) => {
    try {
        if (options.code) {
            const existPromotion = await DB.Promotion.findOne({
                code: options.code,
                isDeleted: false,
                status: { $ne: Enums.PromotionEnums.PromotionStatus.Stop.value }
            });
            if (existPromotion) {
                throw new Error("Promotion code must be unique!");
            }
        } else {
            throw new Error("Promotion code must not be empty!");
        }

        //Convert startDate and endDate to DateTime and validate
        options.startDate = new moment.utc(options.startDate, 'HH:mm DD-MM-YYYY');
        options.endDate = new moment.utc(options.endDate, 'HH:mm DD-MM-YYYY');

        if (options.startDate._d.getTime() > options.endDate._d.getTime()) {
            throw new Error("startDate must be little or equal endDate");
        }

        //Check khoảng thời gian promotion với promotion type
        if (options.promotionTypeId) {
            const promotionType = await DB.PromotionType.findById(options.promotionTypeId);
            if (promotionType) {
                if (!(promotionType.startDate.getTime() <= options.startDate._d.getTime() && options.endDate._d.getTime() <= promotionType.endDate.getTime()))
                    throw new Error("Date range of promotion must be inside date range of promotion type!");
            } else {
                throw new Error("Promotion type not found!");
            }
        }

        //Validate timeApplyConditionType and applyTime
        if (options.timeApplyConditionType === Enums.PromotionEnums.TimeApplyConditionType.Everyday.value &&
            (!options.timeApply || !options.timeApply.moments || !options.timeApply.momentStartDate || !options.timeApply.momentEndDate)) {
            throw new Error("Please enter completely applyTime");
            //throw new Error("Vui lòng nhập đầy đủ thông tin thời điểm áp dụng!");
        }

        if (options.timeApplyConditionType === Enums.PromotionEnums.TimeApplyConditionType.Once.value && (options.timeApply)) {
            throw new Error("Please don't enter applyTime");
            //throw new Error("Vui lòng không nhập thông tin thời điểm áp dụng!");
        }

        // if(options.hubReceiveNoticeDate){
        //   options.hubReceiveNoticeDate = new moment.utc(options.hubReceiveNoticeDate, 'HH:mm DD-MM-YYYY');
        // }

        // if(options.policyApplyType === Enums.PromotionEnums.PolicyApplyType.Limit.value && !options.maximumApplyNumber){
        //   //throw new Error("maximumApplyNumber will be required if policyApplyType is limit");
        //   throw new Error("Vui lòng nhập số xuất nếu loại ngân sách là 'Áp suất phân bổ'");
        // }

        // if(options.policyApplyType === Enums.PromotionEnums.PolicyApplyType.Unlimit.value && options.maximumApplyNumber){
        //   //throw new Error("maximumApplyNumber will be required if policyApplyType is limit");
        //   throw new Error("Vui lòng nhập số xuất nếu loại ngân sách là 'Phân bổ không giới hạn'");
        // }

        // if(options.ordering){
        //   const maxOrderingList = await DB.PromotionType.find(
        //     {
        //       promotionTypeId: options.promotionTypeId,
        //       isDeleted: false,
        //       status: { $not: {
        //         $in:[
        //           Enums.PromotionEnums.PromotionStatus.Finish.value,
        //           Enums.PromotionEnums.PromotionStatus.Stop.value
        //         ]}
        //       }
        //     }
        //   ).sort({ordering: -1});

        //   if((maxOrderingList && maxOrderingList.length > 0 && maxOrderingList[0].ordering + 1 !== options.ordering) || (!maxOrderingList[0] && options.ordering > 1)){
        //     //throw new Error(`Max ordering current is ${maxOrdering[0].maxOrdering ? maxOrdering[0].maxOrdering : 0}!`);
        //     throw new Error(`Số thứ tự chưa có ${maxOrderingList[0] ? maxOrderingList[0].ordering + 1 : 1}!`);
        //   }
        // }

        //check product promotion
        const existPromotionList = await DB.Promotion.find({
                promotionForm: options.promotionForm,
                $or: [{
                        $and: [{
                                startDate: {
                                    $lte: options.startDate
                                }
                            },
                            {
                                endDate: {
                                    $gte: options.endDate
                                }
                            }
                        ]
                    },
                    {
                        $and: [{
                                startDate: {
                                    $lte: options.startDate
                                }
                            },
                            {
                                endDate: {
                                    $gte: options.startDate
                                }
                            }
                        ]
                    },
                    {
                        $and: [{
                                startDate: {
                                    $lte: options.endDate
                                }
                            },
                            {
                                endDate: {
                                    $gte: options.endDate
                                }
                            }
                        ]
                    },
                    {
                        $and: [{
                                startDate: {
                                    $gte: options.startDate
                                }
                            },
                            {
                                endDate: {
                                    $lte: options.endDate
                                }
                            }
                        ]
                    }
                ],
                isDeleted: false,
                isActive: true,
                status: { $ne: Enums.PromotionEnums.PromotionStatus.Stop.value }
            })
            .collation({
                locale: 'vi'
            })
            .populate("promotionType")
            // Khuyến mãi % đơn cho khách hàng mới.
            .populate("discountOrderForNewMember.promotionProducts")
            //Tặng vật phẩm cho đơn khách hàng mới.
            .populate("giveSomeGiftForNewMember.gifts.gift")
            .populate("giveSomeGiftForNewMember.promotionProducts")
            //Khuyến mãi giỏ hàng tặng sản phẩm.
            .populate("checkoutDiscount.promotionProducts.product")
            .populate("checkoutDiscount.gifts.gift")
            //Khuyến mãi sản phẩm theo số lượng.
            .populate("discountOrderFollowProductQuantity.promotionProducts")
            //Giảm giá sản phẩm
            .populate("productDiscount.product")
            //Khuyến mãi đơn mua sp ưu đãi
            .populate("buyGoodPriceProduct.promotionProducts")
            .populate("buyGoodPriceProduct.goodPriceProducts.product")
            //Khuyến mãi % đơn hoặc tiền
            .populate("orderDiscount.promotionProducts")
            // Khuyến mãi giỏ hàng tặng % hoặc tiền
            .populate("checkoutPercentOrMoneyDiscount.promotionProducts.product")
            // Miễn phí giao hàng - freeship
            .populate("freeShip.promotionProducts")
            // Tặng sp cho đơn
            .populate("giveGiftForOrder.promotionProducts")
            // Khuyến mãi sản phẩm tặng sản phẩm
            .populate("bonusProducts.promotionProducts.product")
            .lean()
            .exec();

        options.existPromotionList = existPromotionList;

        //Check value of options with promotion form situation
        switch (options.promotionForm) {
            case Enums.PromotionEnums.PromotionForm.DiscountOrderForNewMember.value:
                {
                    Service.DiscountOrderForNewMember.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.GiveSomeGiftForNewMember.value:
                {
                    Service.GiveSomeGiftForNewMember.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.CheckoutDiscount.value:
                {
                    Service.CheckoutDiscount.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.DiscountOrderFollowProductQuantity.value:
                {
                    Service.DiscountOrderFollowProductQuantity.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.ProductDiscount.value:
                Service.ProductDiscount.checkCreate(options);
                break;
            case Enums.PromotionEnums.PromotionForm.BuyGoodPriceProduct.value:
                {
                    Service.BuyGoodPriceProduct.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.OrderDiscount.value:
                {
                    Service.OrderDiscount.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.FreeShip.value:
                {
                    Service.FreeShip.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.CheckoutPercentOrMoneyDiscount.value:
                {
                    Service.CheckoutPercentOrMoneyDiscount.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.GiveGiftForOrder.value:
                {
                    Service.GiveGiftForOrder.checkCreate(options);
                    break;
                }
            case Enums.PromotionEnums.PromotionForm.BonusProducts.value:
                {
                    Service.BonusProducts.checkCreate(options);
                    break;
                }
            default:
                break;
        }

        // Remove all expected fields from options.
        delete options.existPromotionList;

        //create a promotion
        const promotion = new DB.Promotion(options);
        await promotion.save();

        return;
    } catch (e) {
        throw e;
    }
};

/**
 * Update for promotion
 */
exports.update = async(options) => {
    try {

        let promotion = await DB.Promotion.findById(options.id);

        if (promotion && !promotion.isDeleted) {
            if (promotion.code) {
                const existPromotion = await DB.Promotion.findOne({
                    code: promotion.code,
                    isDeleted: false,
                    _id: {
                        $ne: promotion._id
                    },
                    status: { $ne: Enums.PromotionEnums.PromotionStatus.Stop.value }
                });
                if (existPromotion) {
                    throw new Error("Promotion code must be unique!");
                }
            } else {
                throw new Error("Promotion code must not be empty!");
            }

            // if(options.policyApplyType === Enums.PromotionEnums.PolicyApplyType.Limit.value && !options.maximumApplyNumber){
            //   //throw new Error("maximumApplyNumber will be required if policyApplyType is limit");
            //   throw new Error("Vui lòng nhập số xuất nếu loại ngân sách là 'Áp suất phân bổ'");
            // }

            // if(options.policyApplyType === Enums.PromotionEstatus: { $ne: Enums.PromotionEnums.PromotionStatus.Stop.value }ại ngân sách là 'Áp suất phân bổ'");
            // }

            options.startDate = new moment.utc(options.startDate, 'HH:mm DD-MM-YYYY');
            options.endDate = new moment.utc(options.endDate, 'HH:mm DD-MM-YYYY');

            if (options.startDate._d.getTime() > options.endDate._d.getTime()) {
                throw new Error("startDate must be little or equal endDate");
            }

            //Validate timeApplyConditionType and applyTime
            if (options.timeApplyConditionType === Enums.PromotionEnums.TimeApplyConditionType.Everyday.value &&
                (!options.timeApply || !options.timeApply.moments || !options.timeApply.momentStartDate || !options.timeApply.momentEndDate)) {
                throw new Error("Please enter completely applyTime");
                //throw new Error("Vui lòng nhập đầy đủ thông tin thời điểm áp dụng!");
            }

            if (options.timeApplyConditionType === Enums.PromotionEnums.TimeApplyConditionType.Once.value && (options.timeApply)) {
                throw new Error("Please don't enter applyTime");
                //throw new Error("Vui lòng không nhập thông tin thời điểm áp dụng!");
            }

            // Check khoảng thời gian promotion với promotion type
            if (options.promotionTypeId) {
                const promotionType = await DB.PromotionType.findById(options.promotionTypeId);
                if (promotionType) {
                    if (!(promotionType.startDate.getTime() <= options.startDate._d.getTime() && options.endDate._d.getTime() <= promotionType.endDate.getTime()))
                        throw new Error("Date range of promotion must be inside date range of promotion type!");
                } else {
                    throw new Error("Promotion type not found!");
                }
            }

            // Check product promotion
            const existPromotionList = await DB.Promotion.find({
                    _id: {
                        $ne: options.id
                    },
                    promotionForm: options.promotionForm,
                    $or: [{
                            $and: [{
                                    startDate: {
                                        $lte: options.startDate
                                    }
                                },
                                {
                                    endDate: {
                                        $gte: options.endDate
                                    }
                                }
                            ]
                        },
                        {
                            $and: [{
                                    startDate: {
                                        $lte: options.startDate
                                    }
                                },
                                {
                                    endDate: {
                                        $gte: options.startDate
                                    }
                                }
                            ]
                        },
                        {
                            $and: [{
                                    startDate: {
                                        $lte: options.endDate
                                    }
                                },
                                {
                                    endDate: {
                                        $gte: options.endDate
                                    }
                                }
                            ]
                        },
                        {
                            $and: [{
                                    startDate: {
                                        $gte: options.startDate
                                    }
                                },
                                {
                                    endDate: {
                                        $lte: options.endDate
                                    }
                                }
                            ]
                        }
                    ],
                    isDeleted: false,
                    isActive: true,
                    status: { $ne: Enums.PromotionEnums.PromotionStatus.Stop.value }
                })
                .collation({
                    locale: 'vi'
                })
                .populate("promotionType")
                // Khuyến mãi % đơn cho khách hàng mới.
                .populate("discountOrderForNewMember.promotionProducts")
                // Tặng vật phẩm cho đơn khách hàng mới.
                .populate("giveSomeGiftForNewMember.gifts.gift")
                .populate("giveSomeGiftForNewMember.promotionProducts")
                // Khuyến mãi giỏ hàng tặng sản phẩm.
                .populate("checkoutDiscount.promotionProducts.product")
                .populate("checkoutDiscount.gifts.gift")
                // Khuyến mãi sản phẩm theo số lượng.
                .populate("discountOrderFollowProductQuantity.promotionProducts")
                // Giảm giá sản phẩm
                .populate("productDiscount.product")
                // Khuyến mãi đơn mua sp ưu đãi
                .populate("buyGoodPriceProduct.promotionProducts")
                .populate("buyGoodPriceProduct.goodPriceProducts.product")
                // Khuyến mãi % đơn hoặc tiền
                .populate("orderDiscount.promotionProducts")
                // Khuyến mãi giỏ hàng tặng % hoặc tiền
                .populate("checkoutPercentOrMoneyDiscount.promotionProducts.product")
                // Miễn phí giao hàng - freeship
                .populate("freeShip.promotionProducts")
                // Tặng sp cho đơn
                .populate("giveGiftForOrder.promotionProducts")
                // Khuyến mãi sản phẩm tặng sản phẩm
                .populate("bonusProducts.promotionProducts.product")
                .lean()
                .exec();

            options.existPromotionList = existPromotionList;

            if (options.hubReceiveNoticeDate) {
                promotion.hubReceiveNoticeDate = new moment.utc(options.hubReceiveNoticeDate, 'HH:mm DD-MM-YYYY');
            }

            promotion.promotionTypeId = options.promotionTypeId;
            promotion.promotionForm = options.promotionForm;
            promotion.name = options.name;
            promotion.content = options.content;
            promotion.startDate = options.startDate;
            promotion.endDate = options.endDate;
            promotion.isActive = options.isActive;
            promotion.isRejectApplyMemberId = options.isRejectApplyMemberId;
            promotion.timeApplyConditionType = options.timeApplyConditionType;
            promotion.timeApply = options.timeApply;
            promotion.applyMemberId = options.applyMemberId;
            promotion.applyRole = options.applyRole;
            promotion.promotionForm = options.promotionForm;
            promotion.applyType = options.applyType;
            promotion.areaApply = options.areaApply;
            options.promotion = promotion;

            options.existPromotionList = existPromotionList;
            //Check value of options with promotion form situatiostatus = { $ne: Enums.PromotionEnums.PromotionStatus.Stop.value };n
            switch (options.promotionForm) {
                case Enums.PromotionEnums.PromotionForm.DiscountOrderForNewMember.value:
                    {
                        Service.DiscountOrderForNewMember.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.GiveSomeGiftForNewMember.value:
                    {
                        Service.GiveSomeGiftForNewMember.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.CheckoutDiscount.value:
                    {
                        Service.CheckoutDiscount.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.DiscountOrderFollowProductQuantity.value:
                    {
                        Service.DiscountOrderFollowProductQuantity.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.ProductDiscount.value:
                    Service.ProductDiscount.checkUpdate(options);
                    break;
                case Enums.PromotionEnums.PromotionForm.BuyGoodPriceProduct.value:
                    {
                        Service.BuyGoodPriceProduct.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.OrderDiscount.value:
                    {
                        Service.OrderDiscount.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.FreeShip.value:
                    {
                        Service.FreeShip.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.CheckoutPercentOrMoneyDiscount.value:
                    {
                        Service.CheckoutPercentOrMoneyDiscount.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.GiveGiftForOrder.value:
                    {
                        Service.GiveGiftForOrder.checkUpdate(options);
                        break;
                    }
                case Enums.PromotionEnums.PromotionForm.BonusProducts.value:
                    {
                        Service.BonusProducts.checkUpdate(options);
                        break;
                    }
                default:
                    break;
            }

            // Remove all expected fields from options.
            delete options.existPromotionList;
            promotion = options.promotion;
            delete options.promotion;

        } else {
            throw new Error(PopulateResponse.notFound());
        }

        return await promotion.save();

    } catch (e) {
        throw e;
    }
};

/**
 * Remove for promotionType
 */
exports.remove = async(options) => {
    try {
        const promotion = await DB.Promotion.findById(options.id);

        if (promotion) {
            promotion.isDeleted = true;
            return await promotion.save();
        } else {
            throw new Error("Promotion isn't found!");
        }

    } catch (e) {
        throw e;
    }
};

/**
 * get list Promotion
 */
exports.list = async(options) => {
    const page = Math.max(0, options.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(options.take, 10) || 10;

    try {
        const query = Helper.App.populateDbQuery(options, {
            text: ['code', 'name'],
        });

        if (options.promotionForm) {
            query.promotionForm = options.promotionForm;
        }

        if (options.isActive == true || options.isActive == false)
            query.isActive = options.isActive;

        if (options.startDate) {
            query.startDate = {
                $gte: new moment.utc(options.startDate, 'HH:mm DD-MM-YYYY')
            }
        }

        if (options.endDate) {
            query.endDate = {
                $lte: new moment.utc(options.endDate, 'HH:mm DD-MM-YYYY')
            }
        }

        query.isDeleted = false;

        const sort = Helper.App.populateDBSort(options);
        const count = await DB.Promotion.countDocuments(query);

        //Cập nhật trạng thái cho các promotion được filter
        await this.updatePromotionStatus({
            query,
            take,
            page
        });

        let items = await DB.Promotion.find(query)
            .collation({
                locale: 'vi'
            })
            .populate("promotionType")
            // Khuyến mãi % đơn cho khách hàng mới.
            .populate({
                path: "discountOrderForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Tặng vật phẩm cho đơn khách hàng mới.
            .populate({
                path: "giveSomeGiftForNewMember.gifts.gift",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveSomeGiftForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi giỏ hàng tặng sản phẩm.
            .populate({
                path: "checkoutDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "checkoutDiscount.gifts.gift",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi sản phẩm theo số lượng.
            .populate({
                path: "discountOrderFollowProductQuantity.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Giảm giá sản phẩm
            .populate({
                path: "productDiscount.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi đơn mua sp ưu đãi
            .populate({
                path: "buyGoodPriceProduct.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "buyGoodPriceProduct.goodPriceProducts.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi % đơn hoặc tiền
            .populate({
                path: "orderDiscount.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi giỏ hàng tặng % hoặc tiền
            .populate({
                path: "checkoutPercentOrMoneyDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            // Miễn phí giao hàng - freeship
            .populate({
                path: "freeShip.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Tặng sp cho đơn
            .populate({
                path: "giveGiftForOrder.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveGiftForOrder.gifts.gift",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi sản phẩm tặng sản phẩm
            .populate({
                path: "bonusProducts.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "bonusProducts.promotionProducts.bonusProduct",
                populate: ["mainImage", "category"]
            })
            .sort(sort)
            .skip(page * take)
            .limit(take)
            .lean()
            .exec();

        // rename filePath, mediumPath, thumbPath to fileUrl, mediumUrl, thumbUrl
        // items = await Helper.App.replaceKeysDeep(items, {
        //   filePath: "fileUrl", 
        //   mediumPath: "mediumUrl",
        //   thumbPath: "thumbUrl"
        // });

        return {
            count,
            items
        };
    } catch (e) {
        throw e;
    }
};

exports.listForNotification = async(options) => {
    const page = Math.max(0, options.page - 1) || 0; // using a zero-based page index for use with skip()
    const take = parseInt(options.take, 10) || 10;

    try {
        const query = Helper.App.populateDbQuery(options, {
            text: ['code', 'name'],
        });

        if (options.promotionForm) {
            query.promotionForm = options.promotionForm;
        }

        if (options.isActive == true || options.isActive == false)
            query.isActive = options.isActive;

        if (options.startDate) {
            query.startDate = moment(options.startDate, 'HH:mm DD-MM-YYYY').utc();
        }
        query.isDeleted = false;

        const sort = Helper.App.populateDBSort(options);
        const count = await DB.Promotion.countDocuments(query);

        //Cập nhật trạng thái cho các promotion được filter
        await this.updatePromotionStatus({
            query,
            take,
            page
        });

        const items = await DB.Promotion.find(query)
            .collation({
                locale: 'vi'
            })
            .populate("promotionType")
            // Khuyến mãi % đơn cho khách hàng mới.
            .populate({
                path: "discountOrderForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Tặng vật phẩm cho đơn khách hàng mới.
            .populate({
                path: "giveSomeGiftForNewMember.gifts.gift",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveSomeGiftForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi giỏ hàng tặng sản phẩm.
            .populate({
                path: "checkoutDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "checkoutDiscount.gifts.gift",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi sản phẩm theo số lượng.
            .populate({
                path: "discountOrderFollowProductQuantity.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Giảm giá sản phẩm
            .populate({
                path: "productDiscount.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi đơn mua sp ưu đãi
            .populate({
                path: "buyGoodPriceProduct.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "buyGoodPriceProduct.goodPriceProducts.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi % đơn hoặc tiền
            .populate({
                path: "orderDiscount.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi giỏ hàng tặng % hoặc tiền
            .populate({
                path: "checkoutPercentOrMoneyDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            // Miễn phí giao hàng - freeship
            .populate({
                path: "freeShip.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Tặng sp cho đơn
            .populate({
                path: "giveGiftForOrder.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveGiftForOrder.gifts.gift",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi sản phẩm tặng sản phẩm
            .populate({
                path: "bonusProducts.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "bonusProducts.promotionProducts.bonusProduct",
                populate: ["mainImage", "category"]
            })
            .sort(sort)
            .skip(page * take)
            .limit(take)
            .lean()
            .exec();

        return {
            count,
            items
        };
    } catch (e) {
        throw e;
    }
};

/**
 * get list Promotion for user
 */
exports.listPromotionForUser = async(options, user) => {
    try {
        const query = Helper.App.populateDbQuery(options, {});
        const now = moment.utc();
        var date = new Date();
        var day = date.getDay() + 1;
        // console.log("day", date)
        //bé hơn bằng
        query.startDate = {
            $lte: now
        };
        //lớn hơn bằng 
        query.endDate = {
            $gte: now
        };
        query.isDeleted = false;
        query.isActive = true;

        // cập nhật lại status của promotion type và promotion 
        await Service.PromotionType.updatePromotionTypeStatus({
            query
        });

        query.status = Enums.PromotionEnums.PromotionTypeStatus.Running.value;
        const getTypeList = await DB.PromotionType.find(query)
            .collation({
                locale: 'vi'
            })
            .lean()
            .exec();

        const arrayIdPromotionType = getTypeList.map(function(obj) {
            return obj._id;
        });

        query.promotionTypeId = {
            $in: arrayIdPromotionType
        };

        if (options.applyType) {
            query.applyType = options.applyType;
        }
        if (options.applyCondition) {
            query.applyCondition = options.applyCondition;
        }
        if (options.promotionTypeId) {
            query.promotionTypeId = options.promotionTypeId;
        }

        if (options.areaApply) {
            query.$or = [{
                    areaApply: {
                        $elemMatch: {
                            id: options.areaApply.id
                        }
                    }
                },
                {
                    //áp dụng tât cả các vùng
                    areaApply: {
                        $elemMatch: {
                            id: -1
                        }
                    }
                }
            ];
        }

        if (user) {
            const role = user.userRoles[user.userRoles.length - 1];
            query.$or = [{
                    $and: [{
                        applyMemberId: [],
                        applyRole: {
                            $elemMatch: {
                                role: role.Role === Enums.UserEnums.UserRole.WE_HOME.value ? Enums.UserEnums.UserRole.WE.value : role.Role,
                                level: user.level
                            }
                        }
                    }]
                },
                {
                    $and: [{
                            $or: [{
                                    isRejectApplyMemberId: false
                                },
                                {
                                    isRejectApplyMemberId: null
                                }
                            ],
                            applyMemberId: {
                                $elemMatch: {
                                    memberId: user.memberId
                                }
                            }
                        },
                        {
                            applyRole: {
                                $elemMatch: {
                                    role: role.Role === Enums.UserEnums.UserRole.WE_HOME.value ? Enums.UserEnums.UserRole.WE.value : role.Role,
                                    level: user.level
                                }
                            }
                        }
                    ]
                },
                {
                    $and: [{
                            isRejectApplyMemberId: true,
                            applyMemberId: {
                                $not: {
                                    $elemMatch: {
                                        memberId: user.memberId
                                    }
                                }
                            }
                        },
                        {
                            applyRole: {
                                $elemMatch: {
                                    role: role.Role === Enums.UserEnums.UserRole.WE_HOME.value ? Enums.UserEnums.UserRole.WE.value : role.Role,
                                    level: user.level
                                }
                            }
                        }
                    ]
                }
            ];
        } else {
            query.$or = [{
                $and: [{
                    applyMemberId: [],
                    applyRole: {
                        $elemMatch: {
                            role: Enums.UserEnums.UserRole.WE.value,
                            level: {
                                '$in': [0, 1, 2, 3]
                            }
                        }
                    }
                }]
            }];
        }

        const list = await DB.Promotion.find(query)
            .collation({
                locale: 'vi'
            })
            .populate("promotionType")
            // Khuyến mãi % đơn cho khách hàng mới.
            .populate({
                path: "discountOrderForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Tặng vật phẩm cho đơn khách hàng mới.
            .populate({
                path: "giveSomeGiftForNewMember.gifts.gift",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveSomeGiftForNewMember.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi giỏ hàng tặng sản phẩm.
            .populate({
                path: "checkoutDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "checkoutDiscount.gifts.gift",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi sản phẩm theo số lượng.
            .populate({
                path: "discountOrderFollowProductQuantity.promotionProducts",
                populate: ["mainImage", "category"]
            })
            //Giảm giá sản phẩm
            .populate({
                path: "productDiscount.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi đơn mua sp ưu đãi
            .populate({
                path: "buyGoodPriceProduct.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "buyGoodPriceProduct.goodPriceProducts.product",
                populate: ["mainImage", "category"]
            })
            //Khuyến mãi % đơn hoặc tiền
            .populate({
                path: "orderDiscount.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi giỏ hàng tặng % hoặc tiền
            .populate({
                path: "checkoutPercentOrMoneyDiscount.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            // Miễn phí giao hàng - freeship
            .populate({
                path: "freeShip.promotionProducts",
                populate: ["mainImage", "category"]
            })
            // Tặng sp cho đơn
            .populate({
                path: "giveGiftForOrder.promotionProducts",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "giveGiftForOrder.gifts.gift",
                populate: ["mainImage", "category"]
            })
            // Khuyến mãi sản phẩm tặng sản phẩm
            .populate({
                path: "bonusProducts.promotionProducts.product",
                populate: ["mainImage", "category"]
            })
            .populate({
                path: "bonusProducts.promotionProducts.bonusProduct",
                populate: ["mainImage", "category"]
            })
            .lean()
            .exec();

        //check promotion lặp lại = Everyday (trừ Freeship applyType AnotherOrder)
        var items = [];
        if (list.length > 0) {
            for (i of list) {
                if (i.timeApplyConditionType === Enums.PromotionEnums.TimeApplyConditionType.Everyday.value) {
                    if (i.timeApply.moments.find(x => x = day.toString())) {
                        const momentStartDate = i.timeApply.momentStartDate;
                        const momentEndDate = i.timeApply.momentEndDate;
                        const getTime = time => new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.substring(0, 2), time.substring(3, 5), 0, 0);
                        if (date.getTime() >= getTime(momentStartDate) && date.getTime() <= getTime(momentEndDate)) {
                            items.push(i);
                        }
                    }
                } else {
                    items.push(i);
                }
            }
        }
        //đếm order
        let countOrder = 0;
        if (user) {
            if (items.length > 0) {
                const checkPromotion = items.find(i => i.promotionForm === Enums.PromotionEnums.PromotionForm.DiscountOrderForNewMember.value || i.promotionForm === Enums.PromotionEnums.PromotionForm.GiveSomeGiftForNewMember.value);

                if (checkPromotion) {
                    countOrder = await DB.Transaction.find({
                        userId: user._id,
                        status: 'success',
                        type: 'order'
                    }).count();
                }
            }
        }

        // Modify filePath, mediumPath, thumbPath to right url
        // if (items && items.length > 0) {
        //   items.forEach(element => {
        //     Helper.App.replaceValuesDeep(['filePath', 'mediumPath', 'thumbPath'], (oldValue) => {
        //       return Helper.App.getPublicFileUrl(oldValue);
        //     }, element)
        //   });
        // }

        return {
            countOrder,
            items
        };
    } catch (e) {
        throw e;
    }
};

exports.getProductDetailPromotions = async(product, user, listPromotionForUser) => {
    try {
        let promotionList = [];
        let canApplyPromotionsRes = [];
        if (listPromotionForUser) {
            canApplyPromotionsRes = JSON.parse(listPromotionForUser)
        } else {
            canApplyPromotionsRes = await this.listPromotionForUser({}, user);
        }
        if (canApplyPromotionsRes) {
            const canApplyPromotions = canApplyPromotionsRes.items;
            for (let promotion of canApplyPromotions) {
                switch (promotion.promotionForm) {
                    case Enums.PromotionEnums.PromotionForm.ProductDiscount.value:
                        {
                            if (promotion.productDiscount) {
                                if (promotion.productDiscount.find(x => x.productId.toString() == product._id.toString())) {
                                    promotionList.push(promotion);
                                }
                            }
                            break;
                        }
                    default:
                        {
                            let products = _.get(promotion, `${promotion.promotionForm}.promotionProducts`);
                            if (products && products.find(x => x.product ? x.product._id.toString() === product._id.toString() : x._id.toString() === product._id.toString())) {
                                promotionList.push(promotion);
                            }
                            break;
                        }
                }
            }
        }

        //sort by promotion end date
        if (!_.isEmpty(promotionList)) {
            promotionList = _.orderBy(promotionList, ['endDate'], ['asc']);
        }

        return promotionList;

    } catch (e) {
        throw e;
    }
}

//Check and apply for each order detail
//Options: order, orderDetail, product, promotions, city, applyCondition, user.
exports.checkAndApplyPromotions_OfOrderDetail = async(options) => {
    try {
        //total discount and gift of each order detail
        let promotionStat = {
            discountPercent: 0,
            gifts: []
        }

        //Get can apply promotion list
        const canApplyPromotionsRes = await this.listPromotionForUser(_.pick(options, ["areaApply", "applyCondition"]), options.user);
        const canApplyPromotions = canApplyPromotionsRes.items;
        const promotionApplyList = _.clone(options.promotions);

        for (let promotionInfo of promotionApplyList) {
            const truePromotion = canApplyPromotions.find(x => x._id.toString() == promotionInfo.promotion._id.toString());

            if (!truePromotion) {
                _.remove(options.promotions, function(e) {
                    return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
                });
            } else {
                switch (truePromotion.promotionForm) {
                    // @@------- Giảm giá sản phẩm - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.ProductDiscount.value:
                        {
                            promotionStat = await Service.ProductDiscount.applyPromotion(options, truePromotion, promotionInfo, promotionStat);
                            break;
                        }
                        // @@------- Giảm giá sản phẩm - [End] ----------

                        // @@------- Khuyến mãi sản phẩm theo số lượng - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.DiscountOrderFollowProductQuantity.value:
                        {
                            promotionStat = await Service.DiscountOrderFollowProductQuantity.applyPromotion(options, truePromotion, promotionInfo, promotionStat);
                            break;
                        }
                        // @@------- Khuyến mãi sản phẩm theo số lượng - [End] ----------

                        // @@------- Khuyến mãi đơn mua sp ưu đãi - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.BuyGoodPriceProduct.value:
                        {
                            promotionStat = await Service.BuyGoodPriceProduct.applyPromotion(options, truePromotion, promotionInfo, promotionStat);
                            break;
                        }
                        // @@------- Khuyến mãi đơn mua sp ưu đãi - [End] ----------

                        // @@------- Khuyến mãi sản phẩm tặng sản phẩm - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.BonusProducts.value:
                        {
                            promotionStat = await Service.BonusProducts.applyPromotion(options, truePromotion, promotionInfo, promotionStat);
                            break;
                        }
                        // @@------- Khuyến mãi sản phẩm tặng sản phẩm - [End] ----------
                    default:
                        break;
                }
            }
        }

        return promotionStat;

    } catch (e) {
        throw e;
    }
};

//Check and apply for each order detail
//Options: order, orderDetails, promotions, city, applyCondition, user.
exports.checkAndApplyPromotions_OfOrder = async(options) => {
    try {
        //total discount and gift of each order detail
        let promotionStat = {
            discountPercent: 0,
            gifts: []
        }

        //Get can apply promotion list
        const canApplyPromotionsRes = await this.listPromotionForUser(_.pick(options, ["areaApply", "applyCondition"]), options.user);
        const canApplyPromotions = canApplyPromotionsRes.items;

        //check order number
        const orderCount = canApplyPromotionsRes.countOrder + 1;
        options.order.orderNumber = orderCount;
        const promotionApplyList = _.clone(options.promotions);

        for (let promotionInfo of promotionApplyList) {
            const truePromotion = canApplyPromotions.find(x => x._id.toString() == promotionInfo.promotion._id.toString());

            if (!truePromotion) {
                _.remove(options.promotions, function(e) {
                    return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
                });
                // throw new Error("Products with promotions is invalid!");
            } else {
                switch (truePromotion.promotionForm) {
                    // @@------- Khuyến mãi % đơn cho khách hàng mới - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.DiscountOrderForNewMember.value:
                        {
                            await Service.DiscountOrderForNewMember.applyPromotion(options, truePromotion, promotionInfo, orderCount);
                            break;
                        }
                        // @@------- Khuyến mãi % đơn cho khách hàng mới - [End] ----------

                        // @@------- Tặng vật phẩm cho đơn khách hàng mới - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.GiveSomeGiftForNewMember.value:
                        {
                            promotionStat = await Service.GiveSomeGiftForNewMember.applyPromotion(options, truePromotion, promotionInfo, promotionStat, orderCount);
                            break;
                        }
                        // @@------- Tặng vật phẩm cho đơn khách hàng mới - [End] ----------

                        // @@------- Khuyến mãi giỏ hàng tặng sản phẩm - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.CheckoutDiscount.value:
                        {
                            promotionStat = await Service.CheckoutDiscount.applyPromotion(options, truePromotion, promotionInfo, promotionStat);
                            break;
                        }
                        // @@------- Khuyến mãi giỏ hàng tặng sản phẩm - [End] ----------

                        // @@------- Khuyến mãi % đơn hoặc tiền - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.OrderDiscount.value:
                        {
                            await Service.OrderDiscount.applyPromotion(options, truePromotion, promotionInfo);
                            break;
                        }
                        // @@------- Khuyến mãi % đơn hoặc tiền - [End] ----------

                        // @@------- Miễn phí giao hàng - freeship - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.FreeShip.value:
                        {
                            await Service.FreeShip.applyPromotion(options, truePromotion, promotionInfo, options.user);
                            break;
                        }
                        // @@------- Miễn phí giao hàng - freeship - [End] ----------

                        // @@------- Khuyến mãi giỏ hàng tặng % hoặc tiền - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.CheckoutPercentOrMoneyDiscount.value:
                        {
                            await Service.CheckoutPercentOrMoneyDiscount.applyPromotion(options, truePromotion, promotionInfo);
                            break;
                        }
                        // @@------- Khuyến mãi giỏ hàng tặng % hoặc tiền - [End] ----------

                        // @@------- Tặng sp cho đơn - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.GiveGiftForOrder.value:
                        {
                            promotionStat = await Service.GiveGiftForOrder.applyPromotion(options, truePromotion, promotionInfo, promotionStat);
                            break;
                        }
                        // @@------- Tặng sp cho đơn - [End] ----------

                        // @@------- Khuyến mãi sản phẩm tặng sản phẩm - [Begin] ----------
                    case Enums.PromotionEnums.PromotionForm.BonusProducts.value:
                        {
                            promotionStat = await Service.BonusProducts.applyPromotion(options, truePromotion, promotionInfo, promotionStat);
                            break;
                        }
                        // @@------- Khuyến mãi sản phẩm tặng sản phẩm - [End] ----------
                    default:
                        break;
                }
            }
        }
        return promotionStat;
    } catch (e) {
        throw e;
    }
};

//options: order, orderDetails, user
exports.applyPromotionForOrder = async(options) => {
    try {
        let gifts = [];
        if (options.order && options.orderDetails && options.user) {

            for (let orderDetail of options.orderDetails) {
                //Options: order, product, promotions, city, applyCondition, user.
                const product = await DB.Product.findOne({
                    _id: orderDetail.productId
                });
                const promotionStat = await this.checkAndApplyPromotions_OfOrderDetail({
                    order: options.order,
                    orderDetails: options.orderDetails,
                    orderDetail,
                    product,
                    promotions: orderDetail.promotions,
                    areaApply: options.order.city,
                    applyCondition: Enums.PromotionEnums.ApplyCondition.OrderDetail.value,
                    user: options.user
                });

                if (promotionStat) {
                    if (promotionStat.gifts && promotionStat.gifts.length > 0)
                        Array.prototype.push.apply(gifts, promotionStat.gifts);
                }
            }

            //Tính lại tổng order
            await Service.OrderV2.calculateTotalOrder(options);

            const promotionStat = await this.checkAndApplyPromotions_OfOrder({
                order: options.order,
                orderDetails: options.orderDetails,
                promotions: options.order.promotions,
                areaApply: options.order.city,
                applyCondition: Enums.PromotionEnums.ApplyCondition.Order.value,
                user: options.user
            });

            //Áp dụng mã giảm phí ship cho order.
            if (options.freeShipCode) {
                options.order = await Service.FreeShip.applyFreeShipCode(options.order, options.freeShipCode, options.user);
            }

            if (promotionStat) {
                if (promotionStat.gifts && promotionStat.gifts.length > 0)
                    Array.prototype.push.apply(gifts, promotionStat.gifts);
            }

            if (gifts && gifts.length > 0) {
                for (const gift of gifts) {
                    if (gift) {
                        gift.quantity = gift.quantity ? gift.quantity : 1;

                        const existGift = await options.orderDetails.find(x => x.productId.toString() == gift.product._id.toString());
                        if (existGift) {
                            existGift.promotions = await gift.promotions.map(x => ({
                                discountPercent: 0,
                                discountPrice: 0,
                                promotion: x
                            }));

                            if (existGift.quantity != gift.quantity) {
                                existGift.quantity = gift.quantity;
                            }

                        } else {
                            const newOrderDetail = new DB.OrderDetail(
                                Object.assign(options.customerInfo, {
                                    orderId: options.order._id,
                                    customerId: options.user._id || null,
                                    productId: gift.product._id,
                                    quantity: gift.quantity,
                                    weight: gift.product.weight,
                                    unitPrice: gift.product.salePrice,
                                    currency: options.userCurrency,
                                    userCurrency: options.userCurrency,
                                    promotions: gift.promotions.map(x => ({
                                        discountPercent: 0,
                                        discountPrice: 0,
                                        promotion: x
                                    }))
                                })
                            );

                            options.orderDetails.push(newOrderDetail);
                        }
                    }
                }

                // Xóa những sản phẩm không được tặng
                _.remove(options.orderDetails, function(e) {
                    return !gifts.find(x => (x.product._id.toString() === e.productId.toString() &&
                        (e.unitPrice === 0 || !_.isEmpty(e.promotions))) || e.unitPrice > 0);
                });
            }
        }

        return;
    } catch (e) {
        throw e;
    }
}


exports.updatePromotionStatus = async(options) => {
    try {
        let _options = _.cloneDeep(options);
        const now = moment.utc();
        let promotions = [];

        if (!_options || !_options && !_options.query) {
            _options.query = {};
        }

        _options.query.status = {
            $not: {
                $in: [
                    Enums.PromotionEnums.PromotionStatus.Finish.value,
                    Enums.PromotionEnums.PromotionStatus.Stop.value
                ]
            }
        }

        _options.query.isActive = true;

        // options.query.startDate = { $lte: now };
        // options.query.endDate = { $gte: now }

        if (_options && _options.page && _options.take) {
            promotions = await DB.Promotion.find(_options.query)
                .skip(_options.page * _options.take)
                .limit(_options.take)
                .exec();
        }

        if (promotions.length === 0) {
            promotions = await DB.Promotion.find(_options.query);
        }

        if (promotions && promotions.length > 0) {
            for (promotion of promotions) {
                if (promotion) {
                    switch (promotion.status) {
                        case Enums.PromotionEnums.PromotionStatus.New.value:
                            if (promotion.startDate.getTime() <= now._d.getTime() && now._d.getTime() <= promotion.endDate.getTime()) {
                                //promotion.status = Enums.PromotionEnums.PromotionStatus.Running.value;
                                await DB.Promotion.update({ _id: promotion._id }, { status: Enums.PromotionEnums.PromotionStatus.Running.value });
                            }
                            break;
                        case Enums.PromotionEnums.PromotionStatus.Running.value:
                            if (promotion.endDate.getTime() < now._d.getTime()) {
                                //promotion.status = Enums.PromotionEnums.PromotionStatus.Finish.value;
                                await DB.Promotion.update({ _id: promotion._id }, { status: Enums.PromotionEnums.PromotionStatus.Finish.value });
                            }
                            break;
                    }
                }
            }
        }

    } catch (e) {
        throw e;
    }
}

exports.stopPromotion = async(promotionId) => {
    try {
        if (promotionId) {
            const promotion = await DB.Promotion.findById(promotionId);
            if (promotion) {

                if (promotion.status !== Enums.PromotionEnums.PromotionStatus.Stop.value) {
                    promotion.status = Enums.PromotionEnums.PromotionStatus.Stop.value;
                    await promotion.save();
                } else {
                    throw new Error("This promotion has stopped!");
                }

                // Stop promotion type nếu toàn bộ promotion đã stop
                const promotionsOfThisPromotionType = await DB.Promotion.find({
                    promotionTypeId: promotion.promotionTypeId,
                    status: {
                        $ne: Enums.PromotionEnums.PromotionStatus.Stop.value
                    }
                });
                if (!promotionsOfThisPromotionType) {
                    const promotionType = await new DB.Promotion.findById(promotion.promotionTypeId);
                    if (promotionType) {
                        promotionType.status = Enums.PromotionEnums.PromotionTypeStatus.Stop.value;
                        await promotionType.save();
                    }
                }
            } else {
                throw new Error(PopulateResponse.notFound());
            }
        } else {
            throw new Error("Promotion id is required!");
        }
    } catch (e) {
        throw e;
    }
}

exports.getPromotionProductsOrderBy_PromotionType = async(options, user) => {
    try {
        let responseData = [];
        const promotionsForUser = await this.listPromotionForUser(options, user);
        const param = _.cloneDeep(promotionsForUser);
        if (promotionsForUser) {
            if (!_.isEmpty(promotionsForUser.items)) {
                let counter = 0
                for (const promotion of promotionsForUser.items) {
                    if (promotion) {
                        let resItem;
                        let isExist = false;
                        if (!_.isEmpty(responseData)) {
                            resItem = await responseData.find(x => x.promotionType._id.toString() === promotion.promotionType._id.toString());
                        }

                        if (!resItem) {
                            resItem = {
                                promotionType: promotion.promotionType,
                                promotionProducts: []
                            };
                        } else {
                            isExist = true;
                        }

                        switch (promotion.promotionForm) {
                            case Enums.PromotionEnums.PromotionForm.ProductDiscount.value:
                                {
                                    for (const item of promotion.productDiscount) {
                                        if (_.isEmpty(options.promotionTypeId) && resItem.promotionProducts.length >= 10) {
                                            break;
                                        }
                                        if (item &&
                                            (_.isEmpty(resItem.promotionProducts) ||
                                                !resItem.promotionProducts.find(x => x.product._id.toString() === item.product._id.toString()))) {

                                            const promotions = await Service.Promotion.getProductDetailPromotions(item.product, user, JSON.stringify(param));

                                            item.product.promotions = promotions ? promotions : null;
                                            resItem.promotionProducts.push({
                                                product: item.product,
                                                discountPercent: item.discountPercent
                                            });
                                        }
                                    }
                                    break;
                                }
                            default:
                                {
                                    let products = _.get(promotion, `${promotion.promotionForm}.promotionProducts`);
                                    if (_.isEmpty(options.promotionTypeId)) {
                                        if (resItem.promotionProducts.length < 10) {
                                            const endSlice = 10 - resItem.promotionProducts.length;
                                            products = products.slice(0, endSlice)
                                        } else {
                                            break;
                                        }
                                    }
                                    if (products) {
                                        products = await products.map(x => {
                                            return { product: x.product ? x.product : x }
                                        })

                                        for (const productItem of products) {
                                            const promotions = await Service.Promotion.getProductDetailPromotions(productItem.product, user, JSON.stringify(param));
                                            productItem.product.promotions = promotions ? promotions : null;
                                        }

                                        resItem.promotionProducts = _.concat(resItem.promotionProducts, products);
                                        resItem.promotionProducts = _.uniqBy(resItem.promotionProducts, x => x.product._id.toString());
                                    }
                                    break;
                                }
                        }

                        if (!_.isEmpty(resItem) && !isExist) {
                            responseData.push(resItem);
                        }
                    }
                }
            }
        }
        return responseData;
    } catch (e) {
        throw e;
    }
}