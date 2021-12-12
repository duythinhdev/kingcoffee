const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.giveGiftForOrder) {
            throw new Error("giveGiftForOrder must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listGiveGiftForOrder = options.giveGiftForOrder.promotionProducts;
        if (listGiveGiftForOrder.length > 0) {
            if (options.existPromotionList.length > 0) {
                for (const promotion of options.existPromotionList) {
                    const existList = promotion.giveGiftForOrder.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listGiveGiftForOrder.indexOf(item._id.toString()) > -1) {
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
        if (!options.giveGiftForOrder) {
            throw new Error("giveGiftForOrder must not be empty");
          }

          if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
          }

          const listGiveGiftForOrder = options.giveGiftForOrder.promotionProducts;
          if (listGiveGiftForOrder.length > 0) {
            if (options.existPromotionList.length > 0) {
              for (const promotion of options.existPromotionList) {
                const existList = promotion.giveGiftForOrder.promotionProducts;
                if (existList.length > 0) {
                  for (const item of existList) {
                    if (listGiveGiftForOrder.indexOf(item._id.toString()) > -1) {
                      throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                      //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                    }
                  }
                }
              }
            }
          }

          promotion.giveGiftForOrder = options.giveGiftForOrder;
          promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, promotionStat) => {
    try{
        // Check a product of order details have absent in product list of promotion
        let enoughProduct_GiveGiftForOrder = true;
        for (const item of options.orderDetails) {
          if (item.unitPrice !== 0) {
            const absentProduct = truePromotion.giveGiftForOrder.promotionProducts.find(x => x._id.toString() === item.productId.toString());

            if (!absentProduct) {
              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
              enoughProduct_GiveGiftForOrder = false;
              break;
            }
          }
        }

        if (truePromotion.giveGiftForOrder.totalOrderPriceCondition <= options.order.totalPrice && enoughProduct_GiveGiftForOrder) {
          if (promotionStat.gifts && truePromotion.giveGiftForOrder.gifts) {
            if (truePromotion.giveGiftForOrder.giveGiftType === Enums.PromotionEnums.GiveGiftType.And.value) {
              truePromotion.giveGiftForOrder.gifts.forEach(el => {
                promotionStat.gifts.push({
                  product: el.gift,
                  promotions: [promotionInfo.promotion._id],
                  quantity: el.quantity * Math.floor(options.order.totalPrice / truePromotion.giveGiftForOrder.totalOrderPriceCondition)
                });
              });
            } else if (truePromotion.giveGiftForOrder.giveGiftType === Enums.PromotionEnums.GiveGiftType.Or.value) {
              for (const item of truePromotion.giveGiftForOrder.gifts) {
                const giftChosenByCustomer = await options.orderDetails.find(x => x.productId.toString() === item.gift._id.toString());
                if (giftChosenByCustomer) {
                  promotionStat.gifts.push({
                    product: item.gift,
                    promotions: [promotionInfo.promotion._id],
                    quantity: item.quantity * Math.floor(options.order.totalPrice / truePromotion.giveGiftForOrder.totalOrderPriceCondition)
                  });
                  break;
                }
              }
            }
          }

          _.remove(options.promotions, function (e) {
            return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
          });
        } else {
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