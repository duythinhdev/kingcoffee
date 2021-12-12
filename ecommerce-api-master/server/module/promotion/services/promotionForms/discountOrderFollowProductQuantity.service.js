const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.discountOrderFollowProductQuantity) {
            throw new Error("discountOrderFollowProductQuantity must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listDiscountOrderFollowProductQuantity = options.discountOrderFollowProductQuantity.promotionProducts;
        if (listDiscountOrderFollowProductQuantity.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.discountOrderFollowProductQuantity.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listDiscountOrderFollowProductQuantity.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
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
        if (!options.discountOrderFollowProductQuantity) {
            throw new Error("discountOrderFollowProductQuantity must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listDiscountOrderFollowProductQuantity = options.discountOrderFollowProductQuantity.promotionProducts;
        if (listDiscountOrderFollowProductQuantity.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.discountOrderFollowProductQuantity.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listDiscountOrderFollowProductQuantity.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        promotion.discountOrderFollowProductQuantity = options.discountOrderFollowProductQuantity;
        promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, promotionStat) => {
    try{
        //Check a product of order details have absent in product list of promotion
        var existProduct = truePromotion.discountOrderFollowProductQuantity.promotionProducts.find(x => x._id.toString() == options.product._id.toString());
        if (existProduct && options.orderDetail.quantity >= truePromotion.discountOrderFollowProductQuantity.orderQuantity) {
            promotionInfo.discountPercent = (100 - promotionStat.discountPercent) * truePromotion.discountOrderFollowProductQuantity.discountPercent / 100;
            promotionStat.discountPercent += (100 - promotionStat.discountPercent) * truePromotion.discountOrderFollowProductQuantity.discountPercent / 100;
            promotionInfo.discountPrice = promotionInfo.discountPercent * options.orderDetail.unitPrice * options.orderDetail.quantity / 100;
            options.orderDetail.totalPrice = (100 - promotionInfo.discountPercent) * options.orderDetail.unitPrice * options.orderDetail.quantity / 100;
        } 
        else {
            _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
            });
        }

        return promotionStat;
    }
    catch(e){
        throw e;
    }
}