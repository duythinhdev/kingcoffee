export enum UserRoles {
  Admin = 0,
  WE = 1,
  WE_HOME = 2,
  HUB = 3,
  GENERALCONTRACTOR = 4,
  WE_FREE = 5,
}

export enum OrderLogStatus {
  OrderStatus = 'orderStatus',
  CancelOrder = 'cancelOrder',
}

export enum OrderStatus {
  ordered = 'Đặt hàng thành công',
  confirmed = 'TNI tiếp nhận',
  canceled = 'Đơn hàng đã bị huỷ',
  processing = 'Đang xử lý đơn hàng',
  packed = 'order is packed',
  handedOver = 'Đóng gói & Bàn giao vận chuyển',
  shipping = 'Đang vận chuyển',
  successDelivered = 'Giao hàng thành công',
  failOrdered = 'Đặt hàng thất bại',
  failDelivered = 'Giao hàng thất bại',
}

export enum OrderProgressStep {
  ordered = 1,
  confirmed = 2,
  processing = 3,
  handedOver = 4,
  shipping = 5,
  successDelivered = 6,
}

export enum OrderProgressWEStep {
  ordered = 1,
  processing = 2,
  handedOver = 3,
  shipping = 4,
  successDelivered = 5,
}
export enum ApplyType {
  Order = 'order', // Đơn hàng.
  Product = 'product', // Sản phẩm.
}
export enum ApplyCondition {
  Order = 'order', // Đơn hàng.
  OrderDetail = 'orderDetail', // Sản phẩm.
}

export enum PromotionForm {
  DiscountOrderForNewMember = 'discountOrderForNewMember', // Khuyến mãi % đơn cho khách hàng mới
  GiveSomeGiftForNewMember = 'giveSomeGiftForNewMember', // Tặng vật phẩm cho đơn khách hàng mới.
  CheckoutDiscount = 'checkoutDiscount', // Khuyến mãi giỏ hàng.
  DiscountOrderFollowProductQuantity = 'discountOrderFollowProductQuantity', // Khuyến mãi sản phẩm theo số lượng.
  ProductDiscount = 'productDiscount', // Giảm giá sản phẩm
  BuyGoodPriceProduct = 'buyGoodPriceProduct', // Khuyến mãi đơn mua sp ưu đãi
  OrderDiscount = 'orderDiscount', // Khuyến mãi % đơn
  FreeShip = 'freeShip', // Free ship
  CheckoutPercentOrMoneyDiscount = 'checkoutPercentOrMoneyDiscount', // Khuyến mãi giỏ hàng tặng % đơn hoặc tiền
  GiveGiftForOrder = 'giveGiftForOrder',
  BonusProduct = 'bonusProducts',
}

export enum GiveGiftType {
  And = 'and', // Tặng hết
  Or = 'or', // Chọn một trong các phần quà
}

export enum DiscountType {
  Percent = "percent", // Giảm theo %
  Number = "number" // Giảm theo tiền
}

export enum FreeShipApplyType {
  CurrentOrder = "currentOrder", // Tại đơn
  AnotherOrder = "anotherOrder" // Áp dụng cho đơn bất kỳ tính từ đơn kế tiếp
}

