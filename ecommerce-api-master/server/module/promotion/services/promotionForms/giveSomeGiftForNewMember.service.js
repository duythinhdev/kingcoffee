const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.giveSomeGiftForNewMember) {
            throw new Error("giveSomeGiftForNewMember must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        const listGiveSomeGiftForNewMember = options.giveSomeGiftForNewMember.promotionProducts;
        if (listGiveSomeGiftForNewMember.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.giveSomeGiftForNewMember.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listGiveSomeGiftForNewMember.indexOf(item._id.toString()) > -1) {
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
        if (!options.giveSomeGiftForNewMember) {
            throw new Error("giveSomeGiftForNewMember must not be empty");
          }

          if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
          }

          const listGiveSomeGiftForNewMember = options.giveSomeGiftForNewMember.promotionProducts;
          if (listGiveSomeGiftForNewMember.length > 0) {
            if (options.existPromotionList.length > 0) {
              // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
              for (const promotion of options.existPromotionList) {
                //list product _id
                const existList = promotion.giveSomeGiftForNewMember.promotionProducts;
                if (existList.length > 0) {
                  for (const item of existList) {
                    if (listGiveSomeGiftForNewMember.indexOf(item._id.toString()) > -1) {
                      throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                      //throw new Error("Sản phẩm " + item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                    }
                  }
                }
              }
            }
          }

          promotion.giveSomeGiftForNewMember = options.giveSomeGiftForNewMember;
          promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, promotionStat, orderCount) => {
  try{
    // Check a product of order details have absent in product list of promotion
    let enoughProduct_GiveSomeGiftForNewMember = true;
    for (const item of options.orderDetails) {
      if (item.unitPrice !== 0) {
        const absentProduct = truePromotion.giveSomeGiftForNewMember.promotionProducts.find(x => x._id.toString() === item.productId.toString());

        if (!absentProduct) {
          _.remove(options.promotions, function (e) {
            return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
          });
          enoughProduct_GiveSomeGiftForNewMember = false;
          break;
        }
      }
    }

    // Get discount with order number
    let giveGift = truePromotion.giveSomeGiftForNewMember.orderConditions.find(x => x.orderNumber === orderCount);
    if (giveGift && giveGift.totalOrderPriceCondition <= options.order.totalPrice && enoughProduct_GiveSomeGiftForNewMember) {
      if (promotionStat.gifts && truePromotion.giveSomeGiftForNewMember.gifts) {
        if (truePromotion.giveSomeGiftForNewMember.giveGiftType === Enums.PromotionEnums.GiveGiftType.And.value) {
          truePromotion.giveSomeGiftForNewMember.gifts.forEach(el => {
            promotionStat.gifts.push({
              product: el.gift,
              promotions: [promotionInfo.promotion._id],
              quantity: el.quantity * Math.floor(options.order.totalPrice / giveGift.totalOrderPriceCondition)
            });
          });
        } else if (truePromotion.giveSomeGiftForNewMember.giveGiftType === Enums.PromotionEnums.GiveGiftType.Or.value) {
          for (const item of truePromotion.giveSomeGiftForNewMember.gifts) {
            const giftChosenByCustomer = await options.orderDetails.find(x => x.productId.toString() === item.gift._id.toString());
            if (giftChosenByCustomer) {
              promotionStat.gifts.push({
                product: item.gift,
                promotions: [promotionInfo.promotion._id],
                quantity: item.quantity * Math.floor(options.order.totalPrice / giveGift.totalOrderPriceCondition)
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