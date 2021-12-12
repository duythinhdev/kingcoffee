const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.buyGoodPriceProduct) {
            throw new Error("buyGoodPriceProduct must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listBuyGoodPriceProduct = options.buyGoodPriceProduct.promotionProducts;

        if (listBuyGoodPriceProduct.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //Check sản áp dụng
                    const existPromotionProductList = promotion.buyGoodPriceProduct.promotionProducts;
                    if (existPromotionProductList.length > 0) {
                        for (const item of existPromotionProductList) {
                            if (listBuyGoodPriceProduct.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }

                    //Check sản phẩm ưu đãi
                    const existGoodPriceProductList = promotion.buyGoodPriceProduct.goodPriceProducts;
                    if (existGoodPriceProductList.length > 0) {
                        for (const item of existGoodPriceProductList) {
                            if (listBuyGoodPriceProduct.indexOf(item._id.toString()) > -1) {
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
        if (!options.buyGoodPriceProduct) {
            throw new Error("buyGoodPriceProduct must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listBuyGoodPriceProduct = options.buyGoodPriceProduct.promotionProducts;

        if (listBuyGoodPriceProduct.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //Check sản áp dụng
                    const existPromotionProductList = promotion.buyGoodPriceProduct.promotionProducts;
                    if (existPromotionProductList.length > 0) {
                        for (const item of existPromotionProductList) {
                            if (listBuyGoodPriceProduct.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }

                    //Check sản phẩm ưu đãi
                    const existGoodPriceProductList = promotion.buyGoodPriceProduct.goodPriceProducts;
                    if (existGoodPriceProductList.length > 0) {
                        for (const item of existGoodPriceProductList) {
                            if (listBuyGoodPriceProduct.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.promotion.buyGoodPriceProduct = options.buyGoodPriceProduct;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.OrderDetail.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, promotionStat) => {
    try{
        // Check a product of order details have absent in product list of promotion
        let enoughProduct_BuyGoodPriceProduct = true;
        for (const item of options.orderDetails) {
          if (item.unitPrice !== 0 && (!item.promotions || item.promotions.length === 0)) {
            const absentProduct = truePromotion.buyGoodPriceProduct.promotionProducts.find(x => x._id.toString() === item.productId.toString());

            if (!absentProduct) {
              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
              enoughProduct_BuyGoodPriceProduct = false;
              break;
            }
          }
        }

        var existProduct = truePromotion.buyGoodPriceProduct.goodPriceProducts.find(x => x.product._id.toString() == options.product._id.toString());
        if (existProduct && options.order.totalPrice >= truePromotion.buyGoodPriceProduct.totalOrderPriceCondition && enoughProduct_BuyGoodPriceProduct) {
            promotionInfo.discountPercent = (100 - promotionStat.discountPercent) * existProduct.discountOnProductPercent / 100;
            promotionStat.discountPercent += (100 - promotionStat.discountPercent) * existProduct.discountOnProductPercent / 100;
            promotionInfo.discountPrice = promotionInfo.discountPercent * options.orderDetail.unitPrice * options.orderDetail.quantity / 100;
            options.orderDetail.totalPrice = (100 - promotionInfo.discountPercent) * options.orderDetail.unitPrice * options.orderDetail.quantity / 100;
        } else {
            _.remove(options.promotions, function (e) {
            return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
            });
        }
    }
    catch(e){
        throw e;
    }
}