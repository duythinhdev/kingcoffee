const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.productDiscount) {
            throw new Error("productDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listProductDiscount = options.productDiscount;
        if (listProductDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.productDiscount;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            for (const id of listProductDiscount) {
                                if (id.product === item.product._id.toString()) {
                                    throw new Error(item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                    //throw new Error("Sản phẩm " + item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                }
                            }
                        }
                    }
                }
            }
        }

        options.applyCondition = Enums.PromotionEnums.ApplyCondition.OrderDetail.value;
    } catch (e) {
        throw e;
    }
}

exports.checkUpdate = (options) => {
    try {
        if (!options.productDiscount) {
            throw new Error("productDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listProductDiscount = options.productDiscount;
        if (listProductDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.productDiscount;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            for (const id of listProductDiscount) {
                                if (id.product === item.product._id.toString()) {
                                    throw new Error(item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                    //throw new Error("Sản phẩm " + item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                }
                            }
                        }
                    }
                }
            }
        }

        options.promotion.productDiscount = options.productDiscount;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.OrderDetail.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, promotionStat) => {
    try{
        if (truePromotion.productDiscount) {
            const discount = truePromotion.productDiscount.find(x => x.productId.toString() == options.product._id.toString());
            if (discount) {
              promotionInfo.discountPercent = (100 - promotionStat.discountPercent) * discount.discountPercent / 100;
              promotionStat.discountPercent += (100 - promotionStat.discountPercent) * discount.discountPercent / 100;
              promotionInfo.discountPrice = promotionInfo.discountPercent * options.orderDetail.unitPrice * options.orderDetail.quantity / 100;
              options.orderDetail.totalPrice = (100 - promotionStat.discountPercent) * options.orderDetail.unitPrice * options.orderDetail.quantity / 100;
            } else {
              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
            }
        }

        return promotionStat;
    }
    catch(e){
        throw e;
    }
}