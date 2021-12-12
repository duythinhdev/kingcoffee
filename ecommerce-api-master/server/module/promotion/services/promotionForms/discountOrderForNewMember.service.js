const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.discountOrderForNewMember) {
            throw new Error("discountOrderForNewMember must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        const listDiscountOrderForNewMember = options.discountOrderForNewMember.promotionProducts;
        if (listDiscountOrderForNewMember.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.discountOrderForNewMember.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listDiscountOrderForNewMember.indexOf(item._id.toString()) > -1) {
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
        if (!options.discountOrderForNewMember) {
            throw new Error("discountOrderForNewMember must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        const listDiscountOrderForNewMember = options.discountOrderForNewMember.promotionProducts;
        if (listDiscountOrderForNewMember.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.discountOrderForNewMember.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listDiscountOrderForNewMember.indexOf(item._id.toString()) > -1) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.promotion.discountOrderForNewMember = options.discountOrderForNewMember;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, orderCount) => {
    try{
        // Check a product of order details have absent in product list of promotion
        let enoughProduct_DiscountOrderForNewMember = true;
        for (const item of options.orderDetails) {
          if (item.unitPrice !== 0) {
            const absentProduct = truePromotion.discountOrderForNewMember.promotionProducts.find(x => x._id.toString() === item.productId.toString());

            if (!absentProduct) {
              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
              enoughProduct_DiscountOrderForNewMember = false;
              break;
            }
          }
        }

        // Get discount with order number
        const discountOrder = truePromotion.discountOrderForNewMember.orderConditions.find(x => x.orderNumber === orderCount);
        if (discountOrder && discountOrder.totalOrderPriceCondition <= options.order.totalPrice && enoughProduct_DiscountOrderForNewMember) {
          promotionInfo.discountPercent = discountOrder.discountPercent;
          promotionInfo.discountPrice = discountOrder.discountPercent * options.order.totalPrice / 100;
          options.order.totalPrice -= discountOrder.discountPercent * options.order.totalPrice / 100;
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