export enum PromotionTypes {
  DiscountOrder = 0, // Chiết khấu đơn hàng.
  PromotionCart = 1, // Khuyến mãi giỏ hàng.
  PromotionProduct = 2, // Khuyến mãi sản phẩm.
  PromotionProductCondition = 3, // Khuyến mãi sản phẩm (%) điều kiện.
}

export enum DiscountOrderType {
  DiscountPercent = 0, // Chiết khấu.
  GiveProduct = 1, // Tặng sản phẩm.
}

export enum PromotionProductType {
  QuantityDiscount = 0, // Chiết khấu số lượng.
  ProductPriceDiscount = 1, // Chiết khấu giá sản phẩm.
}

export enum PromotionProductConditionType {
  DiscountProductCondition = 0, // điều kiện Chiết khấu sản phẩm .
  DiscountPercentCondition = 1, // Điều kiện chiết khấu phần trăm.
}
export enum ApplyType {
  Order = "order", // Đơn hàng.
  Product = "product", // Sản phẩm.
}
export enum PromotionForm {
  DiscountOrderForNewMember = "discountOrderForNewMember", // Khuyến mãi % đơn cho khách hàng mới
  GiveSomeGiftForNewMember = "giveSomeGiftForNewMember", // Tặng vật phẩm cho đơn khách hàng mới.
  CheckoutDiscount = "checkoutDiscount", // Khuyến mãi giỏ hàng tặng sản phẩm
  DiscountOrderFollowProductQuantity = "discountOrderFollowProductQuantity", // Khuyến mãi sản phẩm theo số lượng.
  ProductDiscount = "productDiscount", //Giảm giá sản phẩm
  BuyGoodPriceProduct = "buyGoodPriceProduct", // Khuyến mãi đơn mua sp ưu đãi
  OrderDiscount = "orderDiscount", //Khuyến mãi % đơn hoặc tiền
  CheckoutPercentOrMoneyDiscount = "checkoutPercentOrMoneyDiscount", //Khuyến mãi giỏ hàng tặng % hoặc tiền
  FreeShip = "freeShip", //freeship
  GiveGiftForOrder = "giveGiftForOrder", //Tặng sản phẩm cho đơn
  BonusProducts = "bonusProducts", //khuyến mãi sản phẩm tặng sản phẩm
}
export enum PromotionStatus {
  new = "new", // Mới tạo
  running = "running", // Đang hoạt động
  finish = "finish", // Hết hạn
  stop = "stop", // Dừng hoạt động
}
export enum PromotionBudgetType {
  unlimitedAllocation = "unlimitedAllocation", // Phân bổ không giới hạn
  distributionPressure = "distributionPressure", // Áp suất phân bổ
}
export enum PromotionRepeat {
  once = "once", // 1 lần
  everyday = "everyday", // Hàng tuần
}
export enum PromotionRepeatDay {
  monday = "2", // thứ hai
  tuesday = "3", // thứ ba
  wednesday = "4", // thứ tư
  thursday = "5", // thứ năm
  friday = "6", // thứ sáu
  saturday = "7", // thứ bảy
  sunday = "8", // chủ nhật
}
export enum PromotionFreeShipCondition {
  anotherOrder = "anotherOrder", // Áp dụng cho đơn kế tiếp
  currentOrder = "currentOrder", // Đơn hiện tại
}
export enum PromotionConditionType {
  percent = "percent", // %
  cash = "number", // tiền
}
export enum UserRoles {
  WE = 0,
  HUB = 1,
  // GENERALCONTRACTOR = 2
  WE_MEMBER = 5
}

export enum UserRolesNew {
  WE = 1,
  HUB = 3,
  // GENERALCONTRACTOR = 2
  WE_MEMBER = 5
}

export enum TotalOrderPriceConditionType {
  Equal = "equal",
  GreaterThenOrEqual = "greaterThenOrEqual",
  LessThenOrEqual = "lessThenOrEqual",
}
