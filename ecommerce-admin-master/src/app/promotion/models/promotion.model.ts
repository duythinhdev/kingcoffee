export class PromotionModel{
    public promotionTypeId: string = "";
    public applyType: string = "";
    public promotionForm: string = "";
    public code: string = "";
    public name: string = "";
    public startDate: string;
    public endDate: string;
    public content: string = "";
    public applyRole = [];
    public areaApply = [];
    public applyMemberId = [];
    public isActive: Boolean = false;
    // public hubReceiveNoticeDate: string;
    public discountOrderForNewMember: any = null;
    public giveSomeGiftForNewMember: any = null;
    public discountOrderFollowProductQuantity: any = null;
    public checkoutDiscount: any = null;
    public giveGiftForOrder: any = null;
    public buyGoodPriceProduct: any = null;
    public orderDiscount: any = null;
    public checkoutPercentOrMoneyDiscount: any = null;
    public productDiscount: any = null;
    public bonusProducts: any = null;
    public isRejectApplyMemberId : Boolean = false;
    public freeShip:any = null;
    public timeApplyConditionType: string = "once";  // lặp lại
    public timeApply:any;
    public dayRepeat: any;   // thời điểm
    public timeStartLoop:any;  // bắt đầu lặp lại
    public timeEndLoop:any;  // kết thúc lặp lại
    // public budgetType: string = "unlimitedAllocation";   // loại ngân sách
    // public numberRate: string = "";   // số suất
}