const _ = require('lodash');

exports.checkCreate = (options) => {
    try {
        if (!options.checkoutPercentOrMoneyDiscount) {
            throw new Error("checkoutPercentOrMoneyDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        if (options.checkoutPercentOrMoneyDiscount.orderQuantity && options.checkoutPercentOrMoneyDiscount.promotionProducts.find(x => x.quantity) ||
            !options.checkoutPercentOrMoneyDiscount.orderQuantity && options.checkoutPercentOrMoneyDiscount.promotionProducts.find(x => !x.quantity)) {
            throw new Error("Please enter one of options: 'order quantity' or 'quantity of promotion products'!");
            //throw new Error("Vui lòng nhập ĐẦY ĐỦ một trong 2: 'Giỏ hàng mua số lượng' hoặc 'Số lượng của từng sản phẩm áp dụng'!");
        }

        if (options.checkoutPercentOrMoneyDiscount.discountType === Enums.PromotionEnums.DiscountType.Percent.value && options.checkoutPercentOrMoneyDiscount.discountOrderValue > 100) {
            throw new Error("Current discount order value is percent!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là phần trăm!");
        }

        if (options.checkoutPercentOrMoneyDiscount.discountType === Enums.PromotionEnums.DiscountType.Number.value && options.checkoutPercentOrMoneyDiscount.discountOrderValue < 1000) {
            throw new Error("Current discount order value is money!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là số tiền!");
        }

        const listCheckoutPercentOrMoneyDiscount = options.checkoutPercentOrMoneyDiscount.promotionProducts;
        if (listCheckoutPercentOrMoneyDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.checkoutPercentOrMoneyDiscount.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listCheckoutPercentOrMoneyDiscount.find(x => x.product === item.product._id.toString())) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    }catch(e){
        throw e;
    }
}

exports.checkUpdate = (options) => {
    try {
        if (!options.checkoutPercentOrMoneyDiscount) {
            throw new Error("checkoutPercentOrMoneyDiscount must not be empty");
        }

        if (options.applyType != Enums.PromotionEnums.ApplyType.Order.value) {
            throw new Error("applyType is invalid");
        }

        if (options.checkoutPercentOrMoneyDiscount.orderQuantity && options.checkoutPercentOrMoneyDiscount.promotionProducts.find(x => x.quantity) ||
            !options.checkoutPercentOrMoneyDiscount.orderQuantity && options.checkoutPercentOrMoneyDiscount.promotionProducts.find(x => !x.quantity)) {
            throw new Error("Please enter one of options: 'order quantity' or 'quantity of promotion products'!");
            //throw new Error("Vui lòng nhập ĐẦY ĐỦ một trong 2: 'Giỏ hàng mua số lượng' hoặc 'Số lượng của từng sản phẩm áp dụng'!");
        }

        if (options.checkoutPercentOrMoneyDiscount.discountType === Enums.PromotionEnums.DiscountType.Percent.value && options.checkoutPercentOrMoneyDiscount.discountOrderValue > 100) {
            throw new Error("Current discount order value is percent!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là phần trăm!");
        }

        if (options.checkoutPercentOrMoneyDiscount.discountType === Enums.PromotionEnums.DiscountType.Number.value && options.checkoutPercentOrMoneyDiscount.discountOrderValue < 1000) {
            throw new Error("Current discount order value is money!");
            //throw new Error("Giá trị chiết khấu hiện tại phải là số tiền!");
        }

        const listCheckoutPercentOrMoneyDiscount = options.checkoutPercentOrMoneyDiscount.promotionProducts;
        if (listCheckoutPercentOrMoneyDiscount.length > 0) {
            if (options.existPromotionList.length > 0) {
                // const existList = promotion.checkoutDiscountAndDiscountOrderFollowProductQuantity.promotionProducts;
                for (const promotion of options.existPromotionList) {
                    //list product _id
                    const existList = promotion.checkoutPercentOrMoneyDiscount.promotionProducts;
                    if (existList.length > 0) {
                        for (const item of existList) {
                            if (listCheckoutPercentOrMoneyDiscount.find(x => x.product === item.product._id.toString())) {
                                throw new Error(item.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                                //throw new Error("Sản phẩm " + item.product.name + " đã tồn tại trong khuyến mãi " + promotion.name);
                            }
                        }
                    }
                }
            }
        }

        options.promotion.checkoutPercentOrMoneyDiscount = options.checkoutPercentOrMoneyDiscount;
        options.promotion.applyCondition = Enums.PromotionEnums.ApplyCondition.Order.value;
    }catch(e){
        throw e;
    }
}

exports.applyPromotion = async (options, truePromotion, promotionInfo) => {
    try{

        // Check a product of order details have absent in product list of promotion
        let enoughProduct_CheckoutDiscount = true;
        for (const item of options.orderDetails) {
          if (item.unitPrice !== 0) {
            const absentProduct = truePromotion.checkoutPercentOrMoneyDiscount.promotionProducts.find(x => x.product._id.toString() === item.productId.toString());

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

          // Trường hợp tỉ lệ linh động
          if (truePromotion.checkoutPercentOrMoneyDiscount.orderQuantity) {
            let totalOrderOfPromotionProduct = 0;
            options.orderDetails.forEach(item => {
              if (item.unitPrice !== 0) {
                const absentProduct = truePromotion.checkoutPercentOrMoneyDiscount.promotionProducts.find(x => x.product._id.toString() === item.productId.toString());
                if (absentProduct) {
                  totalOrderOfPromotionProduct += item.quantity;
                }
              }
            });

            canApply = totalOrderOfPromotionProduct >= truePromotion.checkoutPercentOrMoneyDiscount.orderQuantity;
          }
          // Trường hợp tỉ lệ do admin setup
          else {
            canApply = true;
            for (const item of options.orderDetails) {
              if (item.unitPrice !== 0) {
                const absentProduct = truePromotion.checkoutPercentOrMoneyDiscount.promotionProducts.find(x => x.product._id.toString() === item.productId.toString());
                if (absentProduct) {
                  if(item.quantity < absentProduct.quantity) {
                    canApply = false;
                    break;
                  }
                }
              }
            }
          }

          if (canApply) {
            if (truePromotion.checkoutPercentOrMoneyDiscount.discountType === Enums.PromotionEnums.DiscountType.Percent.value) {
                promotionInfo.discountPercent = truePromotion.checkoutPercentOrMoneyDiscount.discountOrderValue;
                promotionInfo.discountPrice = truePromotion.checkoutPercentOrMoneyDiscount.discountOrderValue * options.order.totalPrice / 100;
                options.order.totalPrice -= truePromotion.checkoutPercentOrMoneyDiscount.discountOrderValue * options.order.totalPrice / 100;
            } else if (truePromotion.checkoutPercentOrMoneyDiscount.discountType === Enums.PromotionEnums.DiscountType.Number.value) {
                //promotionInfo.discountPercent = (truePromotion.orderDiscount.discountOrderValue / options.order.totalPrice) * 100;
                promotionInfo.discountPrice = truePromotion.checkoutPercentOrMoneyDiscount.discountOrderValue;
                options.order.totalPrice -= truePromotion.checkoutPercentOrMoneyDiscount.discountOrderValue;
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
    }
    catch(e){
        throw e;
    }
}