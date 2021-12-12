const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.checkoutDiscount) {
            throw new Error("checkoutDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        if (options.checkoutDiscount.orderQuantity && options.checkoutDiscount.promotionProducts.find(x => x.quantity) ||
            !options.checkoutDiscount.orderQuantity && options.checkoutDiscount.promotionProducts.find(x => !x.quantity)) {
            throw new Error("Please enter one of options: 'order quantity' or 'quantity of promotion products'!");
            //throw new Error("Vui lòng nhập ĐẦY ĐỦ một trong 2: 'Giỏ hàng mua số lượng' hoặc 'Số lượng của từng sản phẩm áp dụng'!");
        }

        const listcheckoutDiscount = options.checkoutDiscount.promotionProducts;
        if (listcheckoutDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.checkoutDiscount.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listcheckoutDiscount.find(x => x.product === item.product._id.toString())) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
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
        if (!options.checkoutDiscount) {
            throw new Error("checkoutDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Product.value) {
            throw new Error("applyType is invalid");
        }

        if (options.checkoutDiscount.orderQuantity && options.checkoutDiscount.promotionProducts.find(x => x.quantity) ||
            !options.checkoutDiscount.orderQuantity && options.checkoutDiscount.promotionProducts.find(x => !x.quantity)) {
            throw new Error("Please enter one of options: 'order quantity' or 'quantity of promotion products'!");
            //throw new Error("Vui lòng nhập ĐẦY ĐỦ một trong 2: 'Giỏ hàng mua số lượng' hoặc 'Số lượng của từng sản phẩm áp dụng'!");
        }

        const listcheckoutDiscount = options.checkoutDiscount.promotionProducts;
        if (listcheckoutDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.checkoutDiscount.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listcheckoutDiscount.find(x => x.product === item.product._id.toString())) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.promotion.checkoutDiscount = options.checkoutDiscount;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    } catch (e) {
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo, promotionStat) => {
    try{
        // Check a product of order details have absent in product list of promotion
        let enoughProduct_CheckoutDiscount = true;
        for (const item of options.orderDetails) {
          if (item.unitPrice !== 0) {
            const absentProduct = truePromotion.checkoutDiscount.promotionProducts.find(x => x.product._id.toString() === item.productId.toString());

            if (!absentProduct) {
              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
              enoughProduct_CheckoutDiscount = false;
              break;
            }
          }
        }

        if (enoughProduct_CheckoutDiscount) {
          // Check a product of order details have absent in product list of promotion
          let canApply = false;
          // Lũy tiến
          let progressiveness = 0;

          // Trường hợp tỉ lệ linh động
          if (truePromotion.checkoutDiscount.orderQuantity) {
            let totalOrderOfPromotionProduct = 0;
            options.orderDetails.forEach(item => {
              if (item.unitPrice !== 0) {
                const absentProduct = truePromotion.checkoutDiscount.promotionProducts.find(x => x.product._id.toString() === item.productId.toString());
                if (absentProduct) {
                  totalOrderOfPromotionProduct += item.quantity;
                }
              }
            });

            canApply = totalOrderOfPromotionProduct >= truePromotion.checkoutDiscount.orderQuantity;
            progressiveness = Math.floor(totalOrderOfPromotionProduct / truePromotion.checkoutDiscount.orderQuantity);
          }
          // Trường hợp tỉ lệ do admin setup
          else {
            canApply = true;
            for (const item of options.orderDetails) {
              const absentProduct = truePromotion.checkoutDiscount.promotionProducts.find(x => x.product._id.toString() === item.productId.toString());
              if (absentProduct) {
                if (item.unitPrice !== 0) {
                  if (item.quantity >= absentProduct.quantity) {
                    if (progressiveness > Math.floor(item.quantity / absentProduct.quantity) || !progressiveness) {
                      progressiveness = Math.floor(item.quantity / absentProduct.quantity);
                    }
                  } else {
                    canApply = false;
                    break;
                  }
                }
              }
            }
          }

          if (canApply) {
            if (promotionStat.gifts) {
              if (truePromotion.checkoutDiscount.giveGiftType === Enums.PromotionEnums.GiveGiftType.And.value) {
                truePromotion.checkoutDiscount.gifts.forEach(el => {
                  promotionStat.gifts.push({
                    product: el.gift,
                    promotions: [promotionInfo.promotion._id],
                    quantity: el.quantity * progressiveness
                  });
                });
              } else if (truePromotion.checkoutDiscount.giveGiftType === Enums.PromotionEnums.GiveGiftType.Or.value) {
                for (const item of truePromotion.checkoutDiscount.gifts) {
                  const giftChosenByCustomer = await options.orderDetails.find(x => x.productId.toString() === item.gift._id.toString());
                  if (giftChosenByCustomer) {
                    promotionStat.gifts.push({
                      product: item.gift,
                      promotions: [promotionInfo.promotion._id],
                      quantity: item.quantity * progressiveness
                    });
                    break;
                  }
                }
              }

              _.remove(options.promotions, function (e) {
                return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
              });
            }
          } else {
            _.remove(options.promotions, function (e) {
              return e.promotion._id.toString() === promotionInfo.promotion._id.toString();
            });
          }
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