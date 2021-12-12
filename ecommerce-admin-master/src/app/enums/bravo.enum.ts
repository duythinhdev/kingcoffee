export enum DocStatusEnum{
    Waiting = 1,
    Accepted = 2,
    CompletedNotRecord = 3,
    Completed = 4,  
    Blocked = 5,
    Cancelled = 6,
    WCDWroteDone = 101,
    WCDWroteFail = 102
}

export enum DocStatusDesEnum{
    Waiting = "Chờ Duyệt",
    Accepted = "Đã duyệt, chờ hoàn thiện",
    CompletedNotRecord = "Hoàn thiện vật tư, chưa định khoản",
    Completed = "Đã hoàn thiện",  
    Blocked = "Đã khóa",
    Cancelled = "Đã hủy",
    WCDWroteDone = "Ghi dữ liệu WCD thành công",
    WCDWroteFail = "Ghi dữ liệu WCD thất bại"
}