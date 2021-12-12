const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.orderDiscount) {
            throw new Error("orderDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        if (options.orderDiscount.discountType === Enums.PromotionEnums.DiscountType.Percent.value && options.orderDiscount.discountOrderValue > 100) {
            throw new Error("Discount order value current is percent!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là phần trăm!");
        }

        if (options.orderDiscount.discountType === Enums.PromotionEnums.DiscountType.Number.value && options.orderDiscount.discountOrderValue < 1000) {
            throw new Error("Discount order value current is money!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là số tiền!");
        }

        const listOrderDiscount = options.orderDiscount.promotionProducts;
        if (listOrderDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.orderDiscount.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listOrderDiscount.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.checkUpdate = (options) => {
    try {
        if (!options.orderDiscount) {
            throw new Error("orderDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        if (options.orderDiscount.discountType === Enums.PromotionEnums.DiscountType.Percent.value && options.orderDiscount.discountOrderValue > 100) {
            throw new Error("Discount order value current is percent!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là phần trăm!");
        }

        if (options.orderDiscount.discountType === Enums.PromotionEnums.DiscountType.Number.value && options.orderDiscount.discountOrderValue < 1000) {
            throw new Error("Discount order value current is money!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là số tiền!");
        }

        const listOrderDiscount = options.orderDiscount.promotionProducts;
        if (listOrderDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.orderDiscount.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listOrderDiscount.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.promotion.orderDiscount = options.orderDiscount;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo) => {
    try{
        //Check a product of order details have absent in product list of promotion
        let enoughProduct_OrderDiscount = true;
        for (const item of options.orderDetails) {
          if (item.unitPrice !== 0) {
            const absentProduct = truePromotion.orderDiscount.promotionProducts.find(x => x._id.toString() === item.productId.toString());

            if (!absentProduct) {
              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
              enoughProduct_OrderDiscount = false;
              break;
            }
          }
        }

        if (options.order.totalPrice >= truePromotion.orderDiscount.totalOrderPriceCondition && enoughProduct_OrderDiscount) {

          if (truePromotion.orderDiscount.discountType === Enums.PromotionEnums.DiscountType.Percent.value) {
            promotionInfo.discountPercent = truePromotion.orderDiscount.discountOrderValue;
            promotionInfo.discountPrice = truePromotion.orderDiscount.discountOrderValue * options.order.totalPrice / 100;
            options.order.totalPrice -= truePromotion.orderDiscount.discountOrderValue * options.order.totalPrice / 100;
          } else if (truePromotion.orderDiscount.discountType === Enums.PromotionEnums.DiscountType.Number.value) {
            //promotionInfo.discountPercent = (truePromotion.orderDiscount.discountOrderValue / options.order.totalPrice) * 100;
            promotionInfo.discountPrice = truePromotion.orderDiscount.discountOrderValue;
            options.order.totalPrice -= truePromotion.orderDiscount.discountOrderValue;
          }
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