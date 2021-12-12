exports.model = {
    PromotionType: require('./models/promotionType.model'),
    Promotion: require('./models/promotion.model')
};
  
exports.router = (router) => {
    require('./routers/promotionType.route')(router);
    require('./routers/promotion.route')(router);
};
  
exports.services = {
    Promotion: require('./services/promotion.service'),
    PromotionType: require('./services/promotionType.service'),
    DiscountOrderForNewMember: require('./services/promotionForms/discountOrderForNewMember.service'), // Khuyến mãi % đơn cho khách hàng mới
    GiveSomeGiftForNewMember: require('./services/promotionForms/giveSomeGiftForNewMember.service'), // Tặng vật phẩm cho đơn khách hàng mới.
    CheckoutDiscount: require('./services/promotionForms/checkoutDiscount.service'), // Khuyến mãi giỏ hàng.
    DiscountOrderFollowProductQuantity: require('./services/promotionForms/discountOrderFollowProductQuantity.service'), // Khuyến mãi sản phẩm theo số lượng.
    ProductDiscount: require('./services/promotionForms/productDiscount.service'), // Giảm giá sản phẩm
    BuyGoodPriceProduct: require('./services/promotionForms/buyGoodPriceProduct.service'), // Khuyến mãi đơn mua sp ưu đãi
    OrderDiscount: require('./services/promotionForms/orderDiscount.service'), // Khuyến mãi % đơn
    CheckoutPercentOrMoneyDiscount: require('./services/promotionForms/checkoutPercentOrMoneyDiscount.service'), // Khuyến mãi giỏ hàng tặng % hoặc tiền
    FreeShip: require('./services/promotionForms/freeShip.service'),     // Miễn phí vận chuyển
    GiveGiftForOrder: require('./services/promotionForms/giveGiftForOrder.service'),      // Tặng sản phẩm cho đơn
    BonusProducts: require('./services/promotionForms/bonusProducts.service') // Khuyến mãi sản phẩm tặng sản phẩm
}