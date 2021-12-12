const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.bonusProducts) {
            throw new Error("bonusProducts must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listBonusProducts = options.bonusProducts.promotionProducts;
        if (listBonusProducts.length > 0) {
            if (options.existPromotionList.length > 0) {
                for (const promotion of options.existPromotionList) {
                    const existList = promotion.bonusProducts.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listBonusProducts.find(x => x.product === item.product._id.toString())) {
                                throw new Error(item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
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
        if (!options.bonusProducts) {
            throw new Error("bonusProducts must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listBonusProducts = options.bonusProducts.promotionProducts;
        if (listBonusProducts.length > 0) {
            if (options.existPromotionList.length > 0) {
                for (const promotion of options.existPromotionList) {
                    const existList = promotion.bonusProducts.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listBonusProducts.find(x => x.product === item.product._id.toString())) {
                                throw new Error(item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.promotion.bonusProducts = options.bonusProducts;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.OrderDetail.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async(options, truePromotion, promotionInfo, promotionStat) => {
    try {
        let ratio = 0;
        let bonusProduct;
        for (const item of options.orderDetails) {
            if (item.unitPrice !== 0) {
                const absentProduct = truePromotion.bonusProducts.promotionProducts.find(x => x.product._id.toString() === item.productId.toString());

                if (absentProduct) {
                    bonusProduct = absentProduct.bonusProduct;
                    ratio = truePromotion.bonusProducts.bonusQuantity * Math.floor(item.quantity / truePromotion.bonusProducts.orderQuantity);
                    break;
                }
            }
        }

        if (ratio > 0 && bonusProduct) {
            promotionStat.gifts.push({
                product: bonusProduct,
                promotions: [promotionInfo.promotion._id],
                quantity: ratio
            });
        } else {
            _.remove(options.promotions, function(e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
            });
        }

        return promotionStat;
    } catch (e) {
        throw e;
    }
}