import { Component, OnInit } from "@angular/core";
import {
  ApplyType,
  PromotionForm,
  UserRolesNew,
  PromotionRepeat,
  PromotionRepeatDay,
  PromotionBudgetType,
  PromotionFreeShipCondition,
} from "../../../enums/promotion.enum";
import { MediaService } from "../../../media/service";
import { PromotionModel } from "../../models/promotion.model";
import * as ClassicEditor from "../../../../assets/ckeditor/ckeditor";
import {
  NgbDate,
  NgbCalendar,
  NgbDateParserFormatter,
  NgbDateStruct,
} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { PromotionService } from "../../services/promotion.service";
import { FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";
import { NgbTime } from "../../../shared/models/time-picker.model";
import * as _ from "lodash";
import { PromotionTypeStatus } from "../../../enums/promotionType.enum";
@Component({
  selector: "promotion-detail",
  templateUrl: "./promotion-detail.component.html",
  styleUrls: ["./promotion-detail.component.scss"],
})
export class PromotionDetailComponent implements OnInit {
  public promotionProgramType = []; //Promotion Program Type List
  public applyType = ApplyType;
  public promotionForm = PromotionForm;
  public promotionRepeat = PromotionRepeat;
  public promotionRepeatDay = PromotionRepeatDay;
  public promotionBudgetType = PromotionBudgetType;
  public rfPromotion: FormGroup;
  public show: boolean = false;
  public isActive: boolean = false;
  public promotionCode;
  public promotionName;
  public timeHUB;
  public isDisableTimeHub: boolean = false;
  public users: any;
  //user roles
  public userRoles = UserRolesNew;
  public dataListUserRoles = [];
  public changeArray = [];
  public userRoleSelect = [];
  //role apply select
  public dataRoleApply = [];
  public roleApplyList = [];
  public applyProduct = [];
  public applyOrder = [];
  public repeat = [];
  public dayRepeat = [];
  public budgetType = [];
  public dropdownRoleSettings = {};
  public dropdownAreaSettings = {};
  public dropdownDayRepeatSettings = {};
  public listUser = [];
  // dropdownList = [];
  // selectedItems = [];
  public conditionPromotion: string = "";
  public promotion: PromotionModel;
  public Editor = ClassicEditor;
  public ckEditorConfig: any;
  public content: any = "";
  public idUpdate: any;
  public discountOrderAndGiveSomeGiftForNewMember: any;
  public checkoutDiscountAndDiscountOrderFollowProductQuantity: any;
  public buyGoodPriceProduct: any;
  public orderDiscount: any;
  public productDiscount: any;
  public isEdit: boolean = false;
  public isEditObject: boolean = false;
  public notAllowEdit: boolean = false;
  public fromDate: NgbDate;
  public toDate: NgbDate | null = null;
  public minDate: any = null;
  hoveredDate: NgbDate | null = null;
  public fromTime: NgbTime;
  public toTime: NgbTime;
  public timeTimeHUB: NgbTime;
  public checkRepeat: boolean = true;
  public checkBudgetType: boolean = true;
  public showErrorTimeEndLoop: boolean = false;
  constructor(
    private router: Router,
    private mediaService: MediaService,
    public formatter: NgbDateParserFormatter,
    private calendar: NgbCalendar,
    private promotionService: PromotionService,
    private toasty: ToastrService,
    private translate: TranslateService
  ) {
    this.promotion = new PromotionModel();
    this.ckEditorConfig = this.mediaService.config;
  }

  ngOnInit() {
    let dateNow = new Date();
    let now = moment(dateNow).format("DD/MM/YYYY");
    this.minDate = this.setMinDate(now);

    //form
    this.rfPromotion = new FormGroup({
      promotionProgramType: new FormControl(),
      applyType: new FormControl(),
      promotionForm: new FormControl(),
    });
    for (let i in this.promotionForm) {
      if (
        this.promotionForm[i] == "discountOrderForNewMember" ||
        this.promotionForm[i] == "orderDiscount" ||
        this.promotionForm[i] == "checkoutPercentOrMoneyDiscount" ||
        this.promotionForm[i] == "freeShip"
      ) {
        this.applyOrder.push(this.promotionForm[i]);
      } else {
        this.applyProduct.push(this.promotionForm[i]);
      }
    }
    for (let i in this.promotionRepeat) {
      this.repeat.push(this.promotionRepeat[i]);
    }
    for (let i in this.promotionBudgetType) {
      this.budgetType.push(this.promotionBudgetType[i]);
    }
    for (let i in this.promotionRepeatDay) {
      this.dayRepeat.push({
        id: this.promotionRepeatDay[i],
        name: this.translate.instant(this.promotionRepeatDay[i]),
      });
    }
    for (let i in this.userRoles) {
      if (this.userRoles[i] == "WE") {
        let role = 4;
        for (let x = 0; x < role; x++) {
          this.changeArray.push("WE " + x);
        }
      }
      if (this.userRoles[i] == "HUB") {
        this.changeArray.push(this.userRoles[i]);
      }
      if (this.userRoles[i] == "WE_MEMBER") {
        this.changeArray.push("WE MEMBER");
      }
    }
    this.dataListUserRoles = this.changeArray.map((x, i) => {
      return (x = {
        level: i,
        roleName: x,
      });
    });
    this.promotionService.getApplyArea().then((res) => {
      this.dataRoleApply = res.data.map((e, i) => {
        return (e = { id: e.Id, name: e.Name });
      });
    });
    this.dropdownRoleSettings = {
      singleSelection: false,
      idField: "level",
      textField: "roleName",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
    };
    this.dropdownAreaSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
    };
    this.dropdownDayRepeatSettings = {
      singleSelection: false,
      idField: "id",
      textField: "name",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      allowSearchFilter: true,
    };
    this.query();
  }

  setMinDate(data) {
    let dd = data.split("/")[0].padStart(2, "0");
    let mm = data.split("/")[1].padStart(2, "0");
    let yyyy = data.split("/")[2].split(" ")[0];
    dd = parseInt(dd);
    mm = parseInt(mm);
    yyyy = parseInt(yyyy);
    const valueDate: NgbDateStruct = { year: yyyy, month: mm, day: dd };
    return valueDate;
  }

  showDate(data) {
    let dd = data.split("/")[0].padStart(2, "0");
    let mm = data.split("/")[1].padStart(2, "0");
    let yyyy = data.split("/")[2].split(" ")[0];
    dd = parseInt(dd);
    mm = parseInt(mm);
    yyyy = parseInt(yyyy);
    const valueDate: NgbDateStruct = { year: yyyy, month: mm, day: dd };
    return valueDate;
  }
  query() {
    let params = {
      take: 1000000,
      page: 1,
      isActive: true
    };
    this.promotionService.getPromotionTypes(params).then(async (res) => {
      if (res.data && res.data.items) {
        this.promotionProgramType = await res.data.items.filter(
          (x) => x.status == PromotionTypeStatus.New || x.status == PromotionTypeStatus.Running
        );
      }
    });
  }
  editObject(edit: boolean, editObject: boolean, type) {
    if (type == "other") return true;
    return false;
  }
  createTable() {
    if (!this.promotion.applyRole || !this.promotion.applyRole.length) {
      return this.toasty.error("Vui lòng chọn Áp dụng role");
    }
    if (!this.users) {
      return this.toasty.error("Vui lòng nhập đối tượng");
    }
    let checkValidObject = /^\d+(?:[,]\d+)*?$/.test(this.users);
    if (!checkValidObject) {
      return this.toasty.error(
        "Đối tượng chỉ được nhập số và cách nhau bởi dấu phẩy"
      );
    }
    for (let index = 0; index < this.promotion.applyRole.length; index++) {
      let checkRole = this.promotion.applyRole[index].roleName;
      if (checkRole.includes("WE MEMBER")) {
        this.promotion.applyRole[index].role = this.userRoles.WE_MEMBER;
        this.promotion.applyRole[index].level = 0;
      } else if (checkRole.includes("WE")){
        this.promotion.applyRole[index].role = this.userRoles.WE;
      } else {
        this.promotion.applyRole[index].role = this.userRoles.HUB;
        this.promotion.applyRole[index].level = 0;
      }
    }
    const params = {
      CustomerNumber: this.users,
      role: this.promotion.applyRole,
    };
    this.promotionService
      .getListCustomer(params)
      .then((res) => {
        if (res.StatusCode == 200) {
          if (this.listUser.length == 0) {
            this.listUser = res.Data ? res.Data : [];
          } else {
            for (let index = 0; index < res.Data.length; index++) {
              const checkObjectExist = this.listUser.find(
                (x) => x?.CustomerNumber == res.Data[index].CustomerNumber
              );
              if (!checkObjectExist) {
                this.listUser.push(res.Data[index]);
              }
            }
          }
        } else {
          return this.toasty.error(res.Message);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }
  removeObject(index: number) {
    this.listUser.splice(index, 1);
  }
  removeAllUser(index: number) {
    this.listUser =[]
  }
  onItemSelect(item: any) {
    // console.log(1,item);
  }
  onSelectAll(items: any) {
    // console.log(2,items);
  }
  onChangeRepeat() {
    this.promotion.dayRepeat = "";
    this.promotion.timeStartLoop = "";
    this.promotion.timeEndLoop = "";
    this.showErrorTimeEndLoop = false;
    this.promotion.timeApplyConditionType == PromotionRepeat.once
      ? (this.checkRepeat = true)
      : (this.checkRepeat = false);
  }
  // onChangeBudgetType(){
  //   this.promotion.numberRate = '';
  //   this.promotion.budgetType == PromotionBudgetType.unlimitedAllocation ? this.checkBudgetType = true : this.checkBudgetType = false;
  // }
  onChangeTimeEnd(event) {
    if (this.promotion.timeStartLoop && this.promotion.timeEndLoop) {
      if (this.promotion.timeEndLoop.hour < this.promotion.timeStartLoop.hour) {
        this.showErrorTimeEndLoop = true;
      } else if (
        this.promotion.timeEndLoop.hour == this.promotion.timeStartLoop.hour &&
        this.promotion.timeEndLoop.minute <= this.promotion.timeStartLoop.minute
      ) {
        this.showErrorTimeEndLoop = true;
      } else {
        this.showErrorTimeEndLoop = false;
      }
    }
  }
  onDropDownClose() {
    const checkHubExist = this.promotion.applyRole.find((x) => x?.level == 4);
    if (checkHubExist) {
      this.isDisableTimeHub = true;
    } else {
      this.isDisableTimeHub = false;
    }
  }
  showForm() {
    this.conditionPromotion = this.rfPromotion.value?.promotionForm;
    this.show = true;
  }
  changePromotion(event) {
    this.show = false;
    this.promotion.discountOrderForNewMember = null;
    this.promotion.giveSomeGiftForNewMember = null;
    this.promotion.checkoutDiscount = null;
    this.promotion.discountOrderFollowProductQuantity = null;
    this.promotion.giveGiftForOrder = null;
    this.promotion.buyGoodPriceProduct = null;
    this.promotion.orderDiscount = null;
    this.promotion.productDiscount = null;
    this.promotion.checkoutPercentOrMoneyDiscount = null;
    this.promotion.bonusProducts = null;
    this.promotion.freeShip = null;
  }
  importDiscountOrderForNewMember(event) {
    this.promotion.discountOrderForNewMember = event;
  }
  importGiveSomeGiftForNewMember(event) {
    this.promotion.giveSomeGiftForNewMember = event;
  }
  importCheckoutDiscount(event) {
    this.promotion.checkoutDiscount = event;
  }
  importDiscountOrderFollowProductQuantity(event) {
    this.promotion.discountOrderFollowProductQuantity = event;
  }
  importGiveGiftForOrder(event) {
    this.promotion.giveGiftForOrder = event;
  }
  importBuyGoodPriceProduct(event) {
    this.promotion.buyGoodPriceProduct = event;
  }
  importOrderDiscount(event) {
    this.promotion.orderDiscount = event;
  }
  importProductDiscount(event) {
    this.promotion.productDiscount = event;
  }
  importCheckoutPercentOrMoneyDiscount(event) {
    this.promotion.checkoutPercentOrMoneyDiscount = event;
  }
  importBonusProducts(event) {
    this.promotion.bonusProducts = event;
  }
  importFreeShip(event) {
    this.promotion.freeShip = event;
  }
  submit() {
    let hourStart: any;
    let minuteStart: any;
    let hourEnd: any;
    let minuteEnd: any;
    let date = new Date();
    let startDate = "";
    let endDate = "";
    let year = 0;
    let month = 0;
    let day = 0;
    if (!this.promotion.code) {
      return this.toasty.error("Vui lòng điền Mã khuyến mãi");
    }
    if (!this.promotion.name) {
      return this.toasty.error("Vui lòng điền Tên khuyến mãi");
    }
    if (!this.promotion.name) {
      return this.toasty.error("Vui lòng điền Mô tả");
    }
    if (!this.fromDate || !this.toDate) {
      return this.toasty.error(
        "Vui lòng chọn thời gian bắt đầu và kết thúc khuyến mãi"
      );
    }

    if (this.promotion.timeApplyConditionType == PromotionRepeat.everyday) {
      if (
        this.promotion.timeStartLoop &&
        this.promotion.timeEndLoop &&
        this.promotion.dayRepeat
      ) {
        hourStart = this.promotion.timeStartLoop.hour;
        minuteStart = this.promotion.timeStartLoop.minute;
        hourEnd = this.promotion.timeEndLoop.hour;
        minuteEnd = this.promotion.timeEndLoop.minute;
        if (hourStart < 10) {
          hourStart = "0" + hourStart;
        }
        if (minuteStart < 10) {
          minuteStart = "0" + minuteStart;
        }
        if (hourEnd < 10) {
          hourEnd = "0" + hourEnd;
        }
        if (minuteEnd < 10) {
          minuteEnd = "0" + minuteEnd;
        }
        let timeStart = hourStart + ":" + minuteStart;
        let timeEnd = hourEnd + ":" + minuteEnd;
        this.promotion.timeApply = {
          moments: this.promotion.dayRepeat.map((x) => x.id),
          momentStartDate: timeStart,
          momentEndDate: timeEnd,
        };
      } else {
        return this.toasty.error(
          "Vui lòng chọn thời điểm, điền thời gian lặp lại bắt đầu và kết thúc"
        );
      }
    } else {
      this.promotion.timeApply = null;
    }

    if (this.fromDate?.year && this.fromDate?.month && this.fromDate?.day) {
      year = this.fromDate?.year;
      month = this.fromDate?.month;
      day = this.fromDate?.day;
      if (month == 1) {
        month = 0;
      } else {
        month = month - 1;
      }
      date = new Date(
        year,
        month,
        day,
        this.fromTime ? this.fromTime.hour : 0,
        this.fromTime ? this.fromTime.minute : 0
      );
      startDate = moment(date).utc().format("HH:mm DD-MM-YYYY");
    }

    if (this.toDate?.year && this.toDate?.month && this.toDate?.day) {
      year = this.toDate?.year;
      month = this.toDate?.month;
      day = this.toDate?.day;
      if (month == 1) {
        month = 0;
      } else {
        month = month - 1;
      }
      date = new Date(
        year,
        month,
        day,
        this.toTime ? this.toTime.hour : 23,
        this.toTime ? this.toTime.minute : 59
      );
      endDate = moment(date).utc().format("HH:mm DD-MM-YYYY");
    }
    if (this.promotion.areaApply.length == 0) {
      return this.toasty.error("Vui lòng chọn Vùng áp dụng");
    } else {
      if (this.promotion.areaApply.length == this.dataRoleApply.length) {
        this.promotion.areaApply = [
          {
            id: -1,
            name: "Tất cả",
          },
        ];
      } else {
        this.promotion.areaApply = this.promotion.areaApply.map((item) => ({
          id: item?.id,
          name: item?.name,
        }));
      }
    }
    if (this.promotion.applyRole.length == 0) {
      return this.toasty.error("Vui lòng chọn Áp dụng role");
    }
    for (let index = 0; index < this.promotion.applyRole.length; index++) {
      let checkRole = this.promotion.applyRole[index].roleName;
      if (checkRole.includes("WE MEMBER")) {
        this.promotion.applyRole[index].role = this.userRoles.WE_MEMBER;
        this.promotion.applyRole[index].level = 0;
      } else if (checkRole.includes("WE")){
        this.promotion.applyRole[index].role = this.userRoles.WE;
      } else {
        this.promotion.applyRole[index].role = this.userRoles.HUB;
        this.promotion.applyRole[index].level = 0;
      }
    }

    let listUsers;
    if (this.listUser.length == 0) {
      listUsers = [];
    } else {
      listUsers = this.listUser.map((item) => {
        return {
          memberId: item?.CustomerNumber,
          memberName: item?.Name,
          phoneNumber: item?.Mobile,
        };
      });
    }
    // valid giveSomeGiftForNewMember
    if (this.conditionPromotion == PromotionForm.GiveSomeGiftForNewMember) {
      if (this.promotion.giveSomeGiftForNewMember) {
        if (
          this.promotion.giveSomeGiftForNewMember?.orderConditions.length == 0
        )
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        let checkOrderCondition = true;
        this.promotion.giveSomeGiftForNewMember?.orderConditions.map((x) => {
          if (!x?.totalOrderPriceCondition || !x?.orderNumber) {
            checkOrderCondition = false;
          }
        });
        if (!checkOrderCondition)
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        if (this.promotion.giveSomeGiftForNewMember?.gifts.length == 0)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng"
          );
        let checkGift = true;
        this.promotion.giveSomeGiftForNewMember?.gifts.map((y) => {
          if (!y?.gift || !y?.quantity) {
            checkGift = false;
          }
        });
        if (!checkGift)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng"
          );
        if (
          !this.promotion.giveSomeGiftForNewMember?.giveGiftType ||
          this.promotion.giveSomeGiftForNewMember?.promotionProducts.length == 0
        ) {
          return this.toasty.error("Vui lòng chọn sản phẩm được áp dụng");
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid discountOrderForNewMember
    if (this.conditionPromotion == PromotionForm.DiscountOrderForNewMember) {
      if (this.promotion.discountOrderForNewMember) {
        if (
          this.promotion.discountOrderForNewMember?.orderConditions.length == 0
        )
          return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
        let checkOrderCondition = true;
        this.promotion.discountOrderForNewMember?.orderConditions.map((x) => {
          if (
            !x?.totalOrderPriceCondition ||
            !x?.orderNumber ||
            !x?.discountPercent
          ) {
            checkOrderCondition = false;
          }
        });
        if (!checkOrderCondition)
          return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
        if (
          this.promotion.discountOrderForNewMember?.promotionProducts.length ==
          0
        )
          return this.toasty.error("Vui lòng chọn sản phẩm được áp dụng");
      } else {
        return this.toasty.error(
          "Vui lòng điền đầy đủ Điều kiện khuyến mãi và sản phẩm được áp dụng"
        );
      }
    }
    // valid checkoutDiscount
    if (this.conditionPromotion == PromotionForm.CheckoutDiscount) {
      if (this.promotion.checkoutDiscount) {
        if (!this.promotion.checkoutDiscount?.orderQuantity) {
          if (this.promotion.checkoutDiscount?.promotionProducts.length == 0)
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          let checkArrProducts = true;
          this.promotion.checkoutDiscount?.promotionProducts.map((x) => {
            if (!x?.product || !x?.quantity) {
              checkArrProducts = false;
            }
          });
          if (!checkArrProducts) {
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          }
        }
        if (this.promotion.checkoutDiscount?.gifts.length == 0)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng "
          );
        let checkGift = true;
        this.promotion.checkoutDiscount?.gifts.map((x) => {
          if (!x?.gift || !x?.quantity) {
            checkGift = false;
          }
        });
        if (!checkGift)
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng "
          );
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid discountOrderFollowProductQuantity
    if (
      this.conditionPromotion ==
      PromotionForm.DiscountOrderFollowProductQuantity
    ) {
      if (this.promotion.discountOrderFollowProductQuantity) {
        if (
          !this.promotion.discountOrderFollowProductQuantity?.discountPercent ||
          !this.promotion.discountOrderFollowProductQuantity?.orderQuantity
        ) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (
          this.promotion.discountOrderFollowProductQuantity?.promotionProducts
            .length == 0
        ) {
          return this.toasty.error("Vui lòng chọn sản phẩm được áp dụng");
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid productDiscount
    if (this.conditionPromotion == PromotionForm.ProductDiscount) {
      if (this.promotion.productDiscount) {
        if (this.promotion.productDiscount.length == 0)
          return this.toasty.error("Vui lòng chọn sản phẩm được giảm giá");
        let checkProduct = true;
        this.promotion.productDiscount.map((x) => {
          if (!x?.productId || !x?.discountPercent) {
            checkProduct = false;
          }
        });
        if (!checkProduct)
          return this.toasty.error("Vui lòng điền đầy đủ giảm giá sản phẩm");
      } else {
        return this.toasty.error("Vui lòng chọn sản phẩm được giảm giá");
      }
    }
    // valid buyGoodPriceProduct
    if (this.conditionPromotion == PromotionForm.BuyGoodPriceProduct) {
      if (this.promotion.buyGoodPriceProduct) {
        if (!this.promotion.buyGoodPriceProduct?.totalOrderPriceCondition) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (this.promotion.buyGoodPriceProduct?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng");
        if (this.promotion.buyGoodPriceProduct?.goodPriceProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm ưu đãi");
        let checkProduct = true;
        this.promotion.buyGoodPriceProduct?.goodPriceProducts.map((x) => {
          if (!x?.product || !x?.discountOnProductPercent) {
            checkProduct = false;
          }
        });
        if (!checkProduct)
          return this.toasty.error("Vui lòng chọn và điền Sản phẩm ưu đãi");
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Điều kiện khuyến mãi");
      }
    }
    // valid orderDiscount
    if (this.conditionPromotion == PromotionForm.OrderDiscount) {
      if (this.promotion.orderDiscount) {
        if (
          !this.promotion.orderDiscount?.discountOrderValue ||
          !this.promotion.orderDiscount?.totalOrderPriceCondition
        ) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (this.promotion.orderDiscount?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng");
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi đơn hàng");
      }
    }
    // freeship
    if (this.conditionPromotion == PromotionForm.FreeShip) {
      if (this.promotion.freeShip) {
        if (
          !this.promotion.freeShip?.totalOrderPriceCondition ||
          !this.promotion.freeShip?.shippingPriceDiscount ||
          !this.promotion.freeShip?.applyType
        ) {
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        }
        if (
          this.promotion.freeShip?.applyType ==
            PromotionFreeShipCondition.currentOrder &&
          this.promotion.freeShip?.totalOrderPriceCondition >= 1000000
        )
          return this.toasty.error(
            "Giá trị đơn sau chiết khấu phải nhỏ hơn 1.000.000đ khi chọn đơn hiện tại"
          );
        if (
          this.promotion.freeShip?.applyType ==
          PromotionFreeShipCondition.anotherOrder
        ) {
          if (
            !this.promotion.freeShip?.applyStartDate ||
            !this.promotion.freeShip?.applyEndDate
          )
            return this.toasty.error(
              "Vui lòng chọn Hạn sử dụng cho Điều kiện khuyến mãi"
            );
        }
        if (this.promotion.freeShip?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng");
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi đơn hàng");
      }
    }
    // CheckoutPercentOrMoneyDiscount
    if (
      this.conditionPromotion == PromotionForm.CheckoutPercentOrMoneyDiscount
    ) {
      if (this.promotion.checkoutPercentOrMoneyDiscount) {
        if (
          !this.promotion.checkoutPercentOrMoneyDiscount?.orderQuantity &&
          this.promotion.checkoutPercentOrMoneyDiscount?.discountOrderValue
        ) {
          if (
            this.promotion.checkoutPercentOrMoneyDiscount?.promotionProducts
              .length == 0
          )
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          let checkArrProduct = true;
          this.promotion.checkoutPercentOrMoneyDiscount?.promotionProducts.map(
            (x) => {
              if (!x?.product || !x?.quantity) {
                checkArrProduct = false;
              }
            }
          );
          if (!checkArrProduct) {
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          }
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi đơn hàng");
      }
    }
    // GiveGiftForOrder
    if (this.conditionPromotion == PromotionForm.GiveGiftForOrder) {
      if (this.promotion.giveGiftForOrder) {
        if (!this.promotion.giveGiftForOrder?.totalOrderPriceCondition)
          return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
        if (this.promotion.giveGiftForOrder?.promotionProducts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm được áp dụng ");
        if (this.promotion.giveGiftForOrder?.gifts.length == 0)
          return this.toasty.error("Vui lòng chọn Sản phẩm/ Vật phẩm tặng");
        let checkArrProduct = true;
        this.promotion.giveGiftForOrder?.gifts.map((x) => {
          if (!x?.gift || !x?.quantity) {
            checkArrProduct = false;
          }
        });
        if (!checkArrProduct) {
          return this.toasty.error(
            "Vui lòng chọn và điền Sản phẩm/ Vật phẩm tặng "
          );
        }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi sản phẩm");
      }
    }
    // BonusProducts
    if (this.conditionPromotion == PromotionForm.BonusProducts) {
      if (this.promotion.bonusProducts) {
        if (
          !this.promotion.bonusProducts?.orderQuantity ||
          !this.promotion.bonusProducts?.bonusQuantity
        ) return this.toasty.error("Vui lòng điền Điều kiện khuyến mãi");
          if (
            this.promotion.bonusProducts?.promotionProducts
              .length == 0
          )
            return this.toasty.error(
              "Vui lòng chọn Sản phẩm được áp dụng "
            );
          let checkArrProduct = true;
          this.promotion.bonusProducts?.promotionProducts.map(
            (x) => {
              if (!x?.product || !x?.bonusProduct) {
                checkArrProduct = false;
              }
            }
          );
          if (!checkArrProduct) {
            return this.toasty.error(
              "Vui lòng chọn và điền Sản phẩm được áp dụng "
            );
          }
      } else {
        return this.toasty.error("Vui lòng điền đầy đủ Khuyến mãi sản phẩm");
      }
    }

    // if (this.timeHUB) {
    //   if (this.timeHUB.year && this.timeHUB.month && this.timeHUB.day) {
    //     year = this.timeHUB.year;
    //     month = this.timeHUB.month;
    //     day = this.timeHUB.day;
    //     if (month == 1) {
    //       month = 0;
    //     } else {
    //       month = month - 1;
    //     }
    //     date = new Date(
    //       year,
    //       month,
    //       day,
    //       this.timeTimeHUB ? this.timeTimeHUB.hour : 0,
    //       this.timeTimeHUB ? this.timeTimeHUB.minute : 0
    //     );
    //     this.promotion.hubReceiveNoticeDate = moment(date)
    //       .utc()
    //       .format("HH:mm DD-MM-YYYY");
    //   }
    // }

    this.promotion.startDate = startDate;
    this.promotion.endDate = endDate;
    this.promotion.applyMemberId = listUsers;
    this.promotion.promotionTypeId = this.rfPromotion.value?.promotionProgramType;
    this.promotion.applyType = this.rfPromotion.value?.applyType;
    this.promotion.promotionForm = this.conditionPromotion;
    const data = _.pick(this.promotion, [
      "applyMemberId",
      "applyRole",
      "applyType",
      "areaApply",
      "code",
      "content",
      "endDate",
      "isActive",
      "isRejectApplyMemberId",
      "name",
      "promotionForm",
      "promotionTypeId",
      "startDate",
      "timeApplyConditionType",
      "timeApply",
      this.conditionPromotion,
    ]);
    // const params: object = {
    //   promotionTypeId: this.rfPromotion.value?.promotionProgramType?._id,
    //   applyType: this.rfPromotion.value?.applyType?.value,
    //   promotionForm: this.conditionPromotion,
    //   code: this.promotionCode,
    //   name: this.promotionName,
    //   content: this.content,
    //   startDate: this.fromDate ? startDate : '',
    //   endDate: this.toDate ? endDate : '',
    //   areaApply: this.roleApplyList,
    //   applyRole: this.userRoleSelect,
    //   isActive: this.isActive,
    //   applyMemberId: listUsers,
    //   // hubReceiveNoticeDate: this.timeHUB,
    //   discountOrderAndGiveSomeGiftForNewMember: this.discountOrderAndGiveSomeGiftForNewMember ? this.discountOrderAndGiveSomeGiftForNewMember : null,
    //   checkoutDiscountAndDiscountOrderFollowProductQuantity: this.checkoutDiscountAndDiscountOrderFollowProductQuantity ? this.checkoutDiscountAndDiscountOrderFollowProductQuantity : null,
    //   buyGoodPriceProduct: this.buyGoodPriceProduct ? this.buyGoodPriceProduct : null,
    //   orderDiscount: this.orderDiscount ? this.orderDiscount : null,
    //   productDiscount: this.productDiscount ? this.productDiscount : null
    // }
    this.promotionService
      .createPromotion(data)
      .then((res) => {
        this.toasty.success("Tạo mới thành công");
        this.router.navigate(["/promotions/list"]);
      })
      .catch((err) =>
        this.toasty.error(
          this.translate.instant(
            err.error.code == 422
              ? err.error.data.details[0].message
              : err.error.message
          )
        )
      );
  }
  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed))
      ? NgbDate.from(parsed)
      : currentValue;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (
      this.fromDate &&
      !this.toDate &&
      date &&
      date.after(this.fromDate)
    ) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  onDateHUBSelection(date: NgbDate) {
    if (date) {
      this.timeHUB = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate &&
      !this.toDate &&
      this.hoveredDate &&
      date.after(this.fromDate) &&
      date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  formatTimePickerValue(value: NgbTime) {
    if (value) {
      return `${String("00" + value.hour).slice(-2)}:${String(
        "00" + value.minute
      ).slice(-2)} `;
    } else {
      return "";
    }
  }
}
