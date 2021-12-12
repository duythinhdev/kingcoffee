export class StatusOrderHelper {
    static ORDERED = 'Đặt hàng thành công'; 
    static CONFIRMED = 'TNI tiếp nhận'; 
    static CANCELED = 'Đơn hàng đã bị huỷ'; 
    static PROCESSING = 'Đang xử lý đơn hàng';
    static HANDEDOVER = 'Đóng gói & Bàn giao vận chuyển';
    static SHIPPING = 'Đang vận chuyển';
    static SUCCESSDELIVERED = 'Giao hàng thành công';
    static FAILDELIVERED = 'Giao hàng thất bại';
    static FAILORDERED = 'Đặt hàng thất bại';

    static ALLSTATUSORDER = [
        { value: 'ordered', name: StatusOrderHelper.ORDERED },
        { value: 'confirmed', name: StatusOrderHelper.CONFIRMED },
        { value: 'canceled', name: StatusOrderHelper.CANCELED },
        { value: 'processing', name: StatusOrderHelper.PROCESSING },
        { value: 'handedOver', name: StatusOrderHelper.HANDEDOVER },
        { value: 'shipping', name: StatusOrderHelper.SHIPPING },
        { value: 'successDelivered', name: StatusOrderHelper.SUCCESSDELIVERED },
        { value: 'failDelivered', name: StatusOrderHelper.FAILDELIVERED },
        { value: 'failOrdered', name: StatusOrderHelper.FAILORDERED },
    ];
}
